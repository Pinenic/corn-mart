// src/services/stockService.js
import { supabaseAdmin } from "../config/supabase.js";

const ENTRY_FIELDS = `
  id, store_id, product_id, pending_product_name, variant_id, supplier,
  quantity, unit_cost, total_cost, entry_date,
  notes, is_adjustment, created_at, updated_at,
  product:product_id ( id, name, thumbnail_url ),
  variant:variant_id ( id, name, sku )
`.trim();

const stockService = {

  // ── List entries ──────────────────────────────────────────────
  async list(storeId, { page, limit, productId, dateFrom, dateTo, search, status }) {
    let query = supabaseAdmin
      .from("stock_entries")
      .select(ENTRY_FIELDS, { count: "exact" })
      .eq("store_id", storeId);

    if (productId)  query = query.eq("product_id", productId);
    if (dateFrom)   query = query.gte("entry_date", dateFrom);
    if (dateTo)     query = query.lte("entry_date", dateTo);

    // status filter: only listed products, only pending, or all (default)
    if (status === "listed")  query = query.not("product_id", "is", null);
    if (status === "pending") query = query.is("product_id", null);

    if (search?.trim()) {
      query = query.or(
        `supplier.ilike.%${search.trim()}%,notes.ilike.%${search.trim()}%,pending_product_name.ilike.%${search.trim()}%`
      );
    }

    const from = (page - 1) * limit;
    const { data, error, count } = await query
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;
    return { entries: data ?? [], total: count ?? 0 };
  },

  // ── Get single entry ──────────────────────────────────────────
  async getById(storeId, entryId) {
    const { data, error } = await supabaseAdmin
      .from("stock_entries")
      .select(ENTRY_FIELDS)
      .eq("id", entryId)
      .eq("store_id", storeId)
      .single();

    if (error || !data) return null;
    return data;
  },

  // ── Create entry ──────────────────────────────────────────────
  // Accepts either product_id (listed product) or pending_product_name
  // (not yet listed). The route layer already enforces XOR via Joi,
  // but we guard again here since service methods should be safe to
  // call directly (e.g. from other services, scripts, tests).
  async create(storeId, payload) {
    const isPending = !payload.product_id;

    if (isPending && !payload.pending_product_name?.trim()) {
      const err = new Error("pending_product_name is required when product_id is not provided");
      err.statusCode = 422;
      err.code = "MISSING_PRODUCT_REFERENCE";
      throw err;
    }

    // Validate variant belongs to the given product, if both provided
    if (payload.product_id && payload.variant_id) {
      const { data: variant } = await supabaseAdmin
        .from("product_variants")
        .select("id, product_id")
        .eq("id", payload.variant_id)
        .single();

      if (!variant || variant.product_id !== payload.product_id) {
        const err = new Error("variant_id does not belong to the given product_id");
        err.statusCode = 422;
        err.code = "INVALID_VARIANT";
        throw err;
      }
    }

    const { data, error } = await supabaseAdmin
      .from("stock_entries")
      .insert({
        store_id:             storeId,
        product_id:           payload.product_id           ?? null,
        pending_product_name: isPending
                                ? payload.pending_product_name.trim()
                                : null,
        variant_id:           payload.variant_id            ?? null,
        supplier:             payload.supplier?.trim()      ?? null,
        quantity:             payload.quantity,
        unit_cost:            payload.unit_cost,
        total_cost:           payload.total_cost,
        entry_date:           payload.entry_date,
        notes:                payload.notes?.trim()         ?? null,
        is_adjustment:        payload.is_adjustment          ?? false,
      })
      .select(ENTRY_FIELDS)
      .single();

    if (error) throw error;

    // Sync product_variants.stock — only possible for listed products
    // with a specific variant. Pending entries have no stock to sync yet;
    // that happens later when the entry is linked via linkPendingEntries.
    if (!payload.is_adjustment && payload.product_id && payload.variant_id) {
      await supabaseAdmin.rpc("increment_variant_stock", {
        p_variant_id: payload.variant_id,
        p_amount:     payload.quantity,
      });
    }

    return data;
  },

  // ── Update entry ──────────────────────────────────────────────
  async update(storeId, entryId, payload) {
    const { data: existing } = await supabaseAdmin
      .from("stock_entries")
      .select("id, product_id, pending_product_name, variant_id, quantity, is_adjustment")
      .eq("id", entryId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return null;

    // Determine the resulting state after this partial update is applied,
    // to enforce the same XOR rule the DB check constraint enforces.
    const nextProductId = payload.product_id !== undefined
      ? payload.product_id
      : existing.product_id;
    const nextPendingName = payload.pending_product_name !== undefined
      ? payload.pending_product_name
      : existing.pending_product_name;

    if (!nextProductId && !nextPendingName?.trim()) {
      const err = new Error("Entry must have either product_id or pending_product_name");
      err.statusCode = 422;
      err.code = "MISSING_PRODUCT_REFERENCE";
      throw err;
    }
    if (nextProductId && nextPendingName) {
      const err = new Error("Entry cannot have both product_id and pending_product_name — clear one");
      err.statusCode = 422;
      err.code = "AMBIGUOUS_PRODUCT_REFERENCE";
      throw err;
    }

    // If product_id is being cleared, pending_product_name must be set
    // and variant_id must be cleared too (matches DB constraint).
    const update = {};
    const allowed = [
      "product_id", "pending_product_name", "supplier",
      "quantity", "unit_cost", "total_cost",
      "entry_date", "notes", "is_adjustment", "variant_id",
    ];
    for (const key of allowed) {
      if (payload[key] !== undefined) update[key] = payload[key];
    }

    // Auto-clear variant_id if product_id is being removed
    if (payload.product_id === null && update.variant_id === undefined) {
      update.variant_id = null;
    }
    // Auto-clear pending_product_name if product_id is being set
    if (payload.product_id) {
      update.pending_product_name = null;
    }

    update.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("stock_entries")
      .update(update)
      .eq("id", entryId)
      .select(ENTRY_FIELDS)
      .single();

    if (error) throw error;

    // If this update just linked a pending entry to a real variant for
    // the first time, sync the stock increment now.
    const wasPending  = !existing.product_id;
    const nowLinked   = Boolean(data.product_id && data.variant_id);
    if (wasPending && nowLinked && !data.is_adjustment) {
      await supabaseAdmin.rpc("increment_variant_stock", {
        p_variant_id: data.variant_id,
        p_amount:     data.quantity,
      });
    }

    return data;
  },

  // ── Delete entry ──────────────────────────────────────────────
  async delete(storeId, entryId) {
    const { data: existing } = await supabaseAdmin
      .from("stock_entries")
      .select("id")
      .eq("id", entryId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return false;

    const { error } = await supabaseAdmin
      .from("stock_entries")
      .delete()
      .eq("id", entryId);

    if (error) throw error;
    return true;
  },

  // ── Link pending entries to a newly-listed product ─────────────
  // Bulk-updates every stock_entries row matching pending_product_name
  // for this store, setting product_id (and optionally variant_id),
  // clearing pending_product_name, and syncing stock for each.
  //
  // Typical flow: seller logged 3 purchases of "Air Max 97 (incoming)"
  // before listing it. Once they create the real product, call this
  // to retroactively link all 3 entries and credit the stock.
  async linkPendingEntries(storeId, { pendingProductName, productId, variantId }) {
    const { data: matches, error: fetchErr } = await supabaseAdmin
      .from("stock_entries")
      .select("id, quantity, is_adjustment")
      .eq("store_id", storeId)
      .eq("pending_product_name", pendingProductName)
      .is("product_id", null);

    if (fetchErr) throw fetchErr;
    if (!matches || matches.length === 0) {
      return { linked: 0, stockAdded: 0 };
    }

    // If a variant was given, validate it belongs to the product
    if (variantId) {
      const { data: variant } = await supabaseAdmin
        .from("product_variants")
        .select("id, product_id")
        .eq("id", variantId)
        .single();

      if (!variant || variant.product_id !== productId) {
        const err = new Error("variant_id does not belong to the given product_id");
        err.statusCode = 422;
        err.code = "INVALID_VARIANT";
        throw err;
      }
    }

    const ids = matches.map(m => m.id);

    const { error: updateErr } = await supabaseAdmin
      .from("stock_entries")
      .update({
        product_id:           productId,
        variant_id:           variantId ?? null,
        pending_product_name: null,
        updated_at:           new Date().toISOString(),
      })
      .in("id", ids);

    if (updateErr) throw updateErr;

    // Sync stock for the non-adjustment entries, only if a variant was given
    let stockAdded = 0;
    if (variantId) {
      const totalQty = matches
        .filter(m => !m.is_adjustment)
        .reduce((sum, m) => sum + m.quantity, 0);

      if (totalQty !== 0) {
        await supabaseAdmin.rpc("increment_variant_stock", {
          p_variant_id: variantId,
          p_amount:     totalQty,
        });
        stockAdded = totalQty;
      }
    }

    return { linked: ids.length, stockAdded };
  },

  // ── Summary stats ─────────────────────────────────────────────
  // Totals for the summary cards at top of the journal page.
  async getSummary(storeId, { dateFrom, dateTo } = {}) {
    let query = supabaseAdmin
      .from("stock_entries")
      .select("quantity, total_cost, is_adjustment, product_id")
      .eq("store_id", storeId)
      .eq("is_adjustment", false);

    if (dateFrom) query = query.gte("entry_date", dateFrom);
    if (dateTo)   query = query.lte("entry_date", dateTo);

    const { data, error } = await query;
    if (error) throw error;

    const rows = data ?? [];

    return {
      totalUnits:    rows.reduce((s, e) => s + e.quantity, 0),
      totalSpend:    rows.reduce((s, e) => s + Number(e.total_cost), 0),
      entryCount:    rows.length,
      // New: surfaces how much is tied up in not-yet-listed products,
      // useful as a "pending inventory value" indicator.
      pendingCount:  rows.filter(e => !e.product_id).length,
      pendingSpend:  rows
                       .filter(e => !e.product_id)
                       .reduce((s, e) => s + Number(e.total_cost), 0),
    };
  },
};

export default stockService;
