"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, Tag, Percent, DollarSign,
  Package, Truck, Gift, Edit2, ToggleLeft, ToggleRight,
  Calendar, Users, Zap
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import { EditPromotionDrawer } from "@/components/products/EditPromotionDrawer";
import { PROMOTIONS, PROMOTION_TYPES } from "@/lib/products-data";

const TYPE_ICONS = { percentage: Percent, fixed: DollarSign, bogo: Gift, free_shipping: Truck, bundle: Package };

function promoStatus(p) {
  if (!p.is_active)   return { label: "Inactive",  variant: "default" };
  const now   = new Date();
  const start = p.starts_at ? new Date(p.starts_at) : null;
  const end   = p.ends_at   ? new Date(p.ends_at)   : null;
  if (start && now < start) return { label: "Scheduled", variant: "info"    };
  if (end   && now > end  ) return { label: "Expired",   variant: "danger"  };
  if (p.max_uses && p.uses >= p.max_uses) return { label: "Exhausted", variant: "danger" };
  return { label: "Active", variant: "success" };
}

function usagePercent(p) {
  if (!p.max_uses) return null;
  return Math.round((p.uses / p.max_uses) * 100);
}

function promoValueLabel(p) {
  if (p.type === "percentage")   return `${p.value}% off`;
  if (p.type === "fixed")        return `$${p.value} off`;
  if (p.type === "bogo")         return "Buy X get 1 free";
  if (p.type === "free_shipping")return "Free shipping";
  if (p.type === "bundle")       return "Bundle deal";
  return "—";
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState(PROMOTIONS);
  const [search, setSearch]         = useState("");
  const [editPromo, setEdit]        = useState(null);   // null | promo obj | "new"
  const [filterType, setFilterType] = useState("all");

  const filtered = useMemo(() => {
    let list = [...promotions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    if (filterType !== "all") list = list.filter((p) => p.type === filterType);
    return list;
  }, [promotions, search, filterType]);

  const handleSave = (promo) => {
    if (promo.id) {
      setPromotions((prev) => prev.map((p) => p.id === promo.id ? promo : p));
    } else {
      setPromotions((prev) => [...prev, { ...promo, id: `promo-${Date.now()}`, uses: 0, created_at: new Date().toISOString() }]);
    }
  };

  const toggleActive = (id) => {
    setPromotions((prev) => prev.map((p) => p.id === id ? { ...p, is_active: !p.is_active } : p));
  };

  // Summary stats
  const activeCount    = promotions.filter((p) => promoStatus(p).label === "Active").length;
  const totalRedemptions = promotions.reduce((s, p) => s + p.uses, 0);

  return (
    <div>
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/products"
          className="flex items-center gap-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity"
          style={{ color: "var(--color-text-secondary)" }}>
          <ArrowLeft size={14} /> Products
        </Link>
        <span style={{ color: "var(--color-border-md)" }}>/</span>
        <span className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>Promotions</span>
      </div>

      <PageHeader
        title="Promotions"
        description="Manage discount codes and special offers"
        action={
          <Button onClick={() => setEdit("new")}><Plus size={14} /> Create promotion</Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total promotions", value: promotions.length,   icon: Tag    },
          { label: "Active",           value: activeCount,          icon: Zap    },
          { label: "Total redemptions",value: totalRedemptions.toLocaleString(), icon: Users },
          { label: "Promo types",      value: PROMOTION_TYPES.length, icon: Package },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}>
                <Icon size={15} />
              </div>
              <div>
                <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{s.label}</p>
                <p className="text-[18px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{s.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-tertiary)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button onClick={() => setFilterType("all")}
            className="px-3 py-1.5 rounded-lg border text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={{ background: filterType === "all" ? "var(--color-accent-subtle)" : "white", color: filterType === "all" ? "var(--color-accent-text)" : "var(--color-text-secondary)", borderColor: filterType === "all" ? "transparent" : "var(--color-border)" }}>
            All
          </button>
          {PROMOTION_TYPES.map((t) => {
            const active = filterType === t.value;
            return (
              <button key={t.value} onClick={() => setFilterType(t.value)}
                className="px-3 py-1.5 rounded-lg border text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{ background: active ? "var(--color-accent-subtle)" : "white", color: active ? "var(--color-accent-text)" : "var(--color-text-secondary)", borderColor: active ? "transparent" : "var(--color-border)" }}>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Promotions list */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[14px] font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>No promotions found</p>
          <Button onClick={() => setEdit("new")}><Plus size={14} /> Create your first promotion</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((promo) => {
            const status  = promoStatus(promo);
            const pct     = usagePercent(promo);
            const TypeIcon = TYPE_ICONS[promo.type] || Tag;

            return (
              <Card key={promo.id} noPadding className="overflow-hidden">
                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: promo.is_active ? "var(--color-accent-subtle)" : "var(--color-bg)", color: promo.is_active ? "var(--color-accent)" : "var(--color-text-tertiary)" }}>
                    <TypeIcon size={18} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{promo.name}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      {/* Code */}
                      <code className="text-[12px] font-mono font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: "var(--color-bg)", color: "var(--color-text-primary)", border: "0.5px solid var(--color-border-md)" }}>
                        {promo.code}
                      </code>
                      {/* Value */}
                      <span className="text-[12px] font-medium" style={{ color: "var(--color-accent-text)" }}>
                        {promoValueLabel(promo)}
                      </span>
                      {/* Applies to */}
                      <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                        {promo.applies_to === "all" ? "All products"
                          : promo.applies_to === "category" ? promo.category_ids.join(", ")
                          : `${promo.product_ids.length} product${promo.product_ids.length !== 1 ? "s" : ""}`}
                      </span>
                    </div>

                    {/* Dates + conditions */}
                    <div className="flex items-center gap-3 flex-wrap text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {promo.starts_at && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {promo.starts_at}{promo.ends_at ? ` → ${promo.ends_at}` : " (no end)"}
                        </span>
                      )}
                      {promo.min_order_value && <span>Min. ${promo.min_order_value}</span>}
                    </div>

                    {/* Usage bar */}
                    {pct !== null && (
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[11px] mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                          <span>{promo.uses.toLocaleString()} used</span>
                          <span>{promo.max_uses.toLocaleString()} max · {pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "var(--color-bg)" }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? "var(--color-danger)" : pct >= 70 ? "var(--color-warning)" : "var(--color-accent)" }} />
                        </div>
                      </div>
                    )}
                    {pct === null && (
                      <p className="text-[11px] mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                        {promo.uses.toLocaleString()} uses · Unlimited
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleActive(promo.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg)]"
                      style={{ color: promo.is_active ? "var(--color-success)" : "var(--color-text-tertiary)" }}
                      title={promo.is_active ? "Deactivate" : "Activate"}>
                      {promo.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => setEdit(promo)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg)]"
                      style={{ color: "var(--color-text-secondary)" }} title="Edit">
                      <Edit2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {editPromo && (
        <EditPromotionDrawer
          promotion={editPromo === "new" ? null : editPromo}
          onClose={() => setEdit(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
