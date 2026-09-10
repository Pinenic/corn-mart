"use client";
import { ShoppingBag, Heart, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const EVENT_STYLE = {
  order: { Icon: ShoppingBag, color: "var(--color-accent)", bg: "var(--color-accent-subtle)" },
  follower: { Icon: Heart, color: "var(--color-cta)", bg: "var(--color-cta-subtle)" },
};

export function SalesActivityFeed({ events = [], stockAlerts = [] }) {
  return (
    <Card noPadding className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">Activity Feed</h3>
      </div>

      {events.length === 0 && stockAlerts.length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-tertiary)] py-6 text-center">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {events.slice(0,5).map((e, i) => {
            const style = EVENT_STYLE[e.type] ?? EVENT_STYLE.order;
            const Icon = style.Icon;
            return (
              <div key={`${e.type}-${e.created_at}-${i}`} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: style.bg, color: style.color }}
                >
                  <Icon size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-[var(--color-text-primary)]">
                    {e.message}
                    {typeof e.amount === "number" && (
                      <span className="font-semibold"> — {formatPrice(e.amount)}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{timeAgo(e.created_at)}</p>
                </div>
              </div>
            );
          })}

          {stockAlerts.length > 0 && (
            <div className="pt-2 mt-2 border-t border-[var(--color-border)] space-y-3">
              {stockAlerts.slice(0,2).map((a) => (
                <div key={a.product_id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[var(--color-warning-bg)] text-[var(--color-warning)]">
                    <AlertTriangle size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-[var(--color-text-primary)]">{a.message}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">Ongoing — check stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
