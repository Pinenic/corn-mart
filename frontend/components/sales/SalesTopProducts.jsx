"use client";
import Link from "next/link";
import { Package } from "lucide-react";
import { Card } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

export function SalesTopProducts({ products = [] }) {
  const top = products.slice(0, 4);

  return (
    <Card noPadding className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">Top Products</h3>
        <Link href="/dashboard/products" className="text-[12px] font-semibold text-[var(--color-accent)] hover:underline">
          View All
        </Link>
      </div>

      {top.length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-tertiary)] py-6 text-center">No sales yet</p>
      ) : (
        <div className="space-y-1">
          {top.map((p, i) => (
            <Link
              key={p.product_id}
              href={`/dashboard/products/${p.product_id}`}
              className="flex items-center gap-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg)] transition-colors -mx-1 px-1"
            >
              <span className="w-5 text-[12px] font-bold text-[var(--color-text-tertiary)] flex-shrink-0">
                {i + 1}
              </span>
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-bg)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package size={14} className="text-[var(--color-text-tertiary)]" />
                )}
              </div>
              <p className="flex-1 min-w-0 text-[13px] font-medium text-[var(--color-text-primary)] truncate">
                {p.name}
              </p>
              <p className="text-[13px] font-bold text-[var(--color-text-primary)] flex-shrink-0">
                {formatPrice(p.revenue)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
