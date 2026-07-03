"use client";
// app/stock/StockTable.jsx

import { useState } from "react";
import {
  Search, Filter, Trash2, Pencil, ChevronLeft, ChevronRight,
  Package, AlertTriangle, ArrowUpDown, ArrowDown, ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────

function formatCurrency(val) {
  return `K${Number(val ?? 0).toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Filter bar ─────────────────────────────────────────────────
function FilterBar({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  const hasActive = filters.search || filters.dateFrom || filters.dateTo || filters.includeAdjustments;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--color-text-muted)" }} />
        <input
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value, page: 1 })}
          placeholder="Search supplier or notes…"
          className="w-full h-9 pl-8 pr-3 rounded-xl border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
          style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }}
        />
      </div>

      {/* Date range */}
      <input
        type="date"
        value={filters.dateFrom}
        onChange={e => onChange({ ...filters, dateFrom: e.target.value, page: 1 })}
        className="h-9 px-2.5 rounded-xl border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
        style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }}
      />
      <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>to</span>
      <input
        type="date"
        value={filters.dateTo}
        onChange={e => onChange({ ...filters, dateTo: e.target.value, page: 1 })}
        className="h-9 px-2.5 rounded-xl border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
        style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }}
      />

      {/* Adjustments toggle */}
      <label className="flex items-center gap-2 h-9 px-3 rounded-xl border cursor-pointer text-[12px] font-medium select-none"
        style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)", background: "white" }}>
        <input
          type="checkbox"
          checked={filters.includeAdjustments}
          onChange={e => onChange({ ...filters, includeAdjustments: e.target.checked, page: 1 })}
          className="w-3.5 h-3.5 accent-[var(--color-accent)]"
        />
        Show adjustments
      </label>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => onChange({ search: "", dateFrom: "", dateTo: "", includeAdjustments: false, page: 1 })}
          className="h-9 px-3 rounded-xl text-[12px] font-medium transition-colors hover:bg-[var(--color-danger-bg)]"
          style={{ color: "var(--color-danger)", border: "1px solid var(--color-danger)" }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ── Delete confirmation ───────────────────────────────────────
function DeleteConfirm({ entry, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        style={{ border: "1px solid var(--color-border)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--color-danger-bg)" }}>
          <AlertTriangle size={22} style={{ color: "var(--color-danger)" }} />
        </div>
        <h3 className="text-[16px] font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>
          Delete this entry?
        </h3>
        <p className="text-[13px] mb-1" style={{ color: "var(--color-text-secondary)" }}>
          <strong>{entry?.product?.name}</strong>
          {entry?.variant?.name && ` — ${entry.variant.name}`}
        </p>
        <p className="text-[12px] mb-5" style={{ color: "var(--color-text-muted)" }}>
          {formatDate(entry?.entry_date)} · {entry?.quantity} units · {formatCurrency(entry?.total_cost)}
        </p>
        <p className="text-[12px] mb-5" style={{ color: "var(--color-text-secondary)" }}>
          This cannot be undone. The entry will be permanently removed from your journal.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 h-10 rounded-xl border text-[13px] font-semibold hover:bg-[var(--color-bg)] transition-colors"
            style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-10 rounded-xl text-[13px] font-bold text-white disabled:opacity-50 transition-colors"
            style={{ background: "var(--color-danger)" }}>
            {loading ? "Deleting…" : "Delete entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Column header with sort ────────────────────────────────────
function ColHeader({ label, field, sort, onSort, className }) {
  const active = sort?.field === field;
  return (
    <th className={cn("text-left py-3 px-4 cursor-pointer select-none group", className)}
      onClick={() => onSort?.(field)}>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: active ? "var(--color-accent)" : "var(--color-text-muted)" }}>
          {label}
        </span>
        {active
          ? sort.dir === "asc"
            ? <ArrowUp size={11} style={{ color: "var(--color-accent)" }} />
            : <ArrowDown size={11} style={{ color: "var(--color-accent)" }} />
          : <ArrowUpDown size={11} className="opacity-0 group-hover:opacity-40 transition-opacity"
              style={{ color: "var(--color-text-muted)" }} />
        }
      </div>
    </th>
  );
}

// ── Main table ─────────────────────────────────────────────────
export function StockTable({
  entries,
  total,
  isLoading,
  isRefreshing,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  deleteLoading,
  page,
  limit,
  onPageChange,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sort, setSort] = useState({ field: "entry_date", dir: "desc" });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSort = (field) => {
    setSort(prev =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "desc" }
    );
  };

  // Client-side sort on top of server-sorted data
  const sorted = [...(entries ?? [])].sort((a, b) => {
    let av = a[sort.field], bv = b[sort.field];
    if (sort.field === "product") { av = a.product?.name; bv = b.product?.name; }
    if (typeof av === "string") return sort.dir === "asc" ? av.localeCompare(bv ?? "") : (bv ?? "").localeCompare(av);
    return sort.dir === "asc" ? (av ?? 0) - (bv ?? 0) : (bv ?? 0) - (av ?? 0);
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-4">
        <FilterBar filters={filters} onChange={onFilterChange} />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--color-border)", opacity: isRefreshing ? 0.7 : 1, transition: "opacity 0.2s" }}>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--color-border-md)", borderTopColor: "var(--color-accent)" }} />
            <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>Loading entries…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--color-bg)" }}>
              <Package size={26} style={{ color: "var(--color-text-muted)" }} />
            </div>
            <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              No entries found
            </p>
            <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
              {filters.search || filters.dateFrom || filters.dateTo
                ? "Try adjusting your filters"
                : "Start by logging your first stock purchase"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                <tr>
                  <ColHeader label="Date"       field="entry_date"   sort={sort} onSort={handleSort} />
                  <ColHeader label="Product"    field="product"      sort={sort} onSort={handleSort} />
                  <ColHeader label="Supplier"   field="supplier"     sort={sort} onSort={handleSort} className="hidden md:table-cell" />
                  <ColHeader label="Units"      field="quantity"     sort={sort} onSort={handleSort} />
                  <ColHeader label="Unit cost"  field="unit_cost"    sort={sort} onSort={handleSort} className="hidden sm:table-cell" />
                  <ColHeader label="Total"      field="total_cost"   sort={sort} onSort={handleSort} />
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry, i) => (
                  <tr key={entry.id}
                    className="group border-t hover:bg-[var(--color-bg)] transition-colors"
                    style={{ borderColor: "var(--color-border)" }}>

                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="text-[12px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {formatDate(entry.entry_date)}
                        </p>
                        {entry.is_adjustment && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)" }}>
                            Adjustment
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: "var(--color-bg)" }}>
                          {entry.product?.thumbnail_url
                            ? <img src={entry.product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            : <Package size={14} className="m-auto mt-1.5" style={{ color: "var(--color-text-muted)" }} />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold truncate max-w-[160px]"
                            style={{ color: "var(--color-text-primary)" }}>
                            {entry.product?.name ?? entry?.pending_product_name}
                          </p>
                          {entry.variant?.name && (
                            <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                              {entry.variant.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                        {entry.supplier ?? <span style={{ color: "var(--color-text-muted)" }}>—</span>}
                      </p>
                    </td>

                    {/* Units */}
                    <td className="py-3.5 px-4">
                      <p className="text-[13px] font-semibold tabular-nums"
                        style={{ color: entry.quantity < 0 ? "var(--color-danger)" : "var(--color-text-primary)" }}>
                        {entry.quantity > 0 ? "+" : ""}{entry.quantity}
                      </p>
                    </td>

                    {/* Unit cost */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <p className="text-[12px] tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                        {formatCurrency(entry.unit_cost)}
                      </p>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4">
                      <p className="text-[13px] font-bold tabular-nums"
                        style={{ color: "var(--color-accent)" }}>
                        {formatCurrency(entry.total_cost)}
                      </p>
                      {entry.notes && (
                        <p className="text-[10px] mt-0.5 truncate max-w-[120px]"
                          style={{ color: "var(--color-text-muted)" }}>
                          {entry.notes}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(entry)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-accent-subtle)]"
                          style={{ color: "var(--color-text-secondary)" }}
                          title="Edit entry"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(entry)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-danger-bg)]"
                          style={{ color: "var(--color-text-secondary)" }}
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              {total.toLocaleString()} entr{total !== 1 ? "ies" : "y"} · Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border transition-colors hover:bg-white disabled:opacity-40"
                style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xl border transition-colors hover:bg-white disabled:opacity-40"
                style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirm
          entry={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
