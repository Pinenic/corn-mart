"use client";
import Link from "next/link";
import { Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

export function StoreCard({ store }) {
  return (
    <Link href={`/marketplace/stores/${store.id}`}>
      <div className="group bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg hover:border-[var(--color-border-md)] transition-all duration-300 cursor-pointer">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-bg)] relative overflow-hidden">
          {store.banner
            ? <img src={store.banner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100" />
          }
        </div>

        <div className="px-4 pb-4">
          {/* Logo + name row */}
          <div className="flex items-end gap-3 -mt-6 mb-3">
            <div className="w-12 h-12 rounded-xl border-2 border-white bg-white shadow-sm overflow-hidden flex-shrink-0">
              {store.logo
                ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {store.name?.[0]}
                  </div>
              }
            </div>
            <div className="flex-1 min-w-0 mb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[14px] font-bold text-[var(--color-text-primary)] truncate">{store.name}</p>
                {store.is_verified && (
                  <ShieldCheck size={14} className="text-[var(--color-primary)] flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2 mb-3 leading-relaxed">{store.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              <Users size={12} />
              <span>{(store.followers_count ?? 0).toLocaleString()} followers</span>
            </div>
            <span className="text-[11px] font-semibold text-[var(--color-primary)] group-hover:underline">
              Visit store →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
