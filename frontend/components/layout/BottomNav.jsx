"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { BOTTOM_TAB_ITEMS } from "@/lib/nav";
import { useDrawer } from "@/lib/DrawerContext";

export function BottomNav() {
  const pathname = usePathname();
  const { toggle } = useDrawer();

  const isActive = (href) => pathname.startsWith(href);

  return (
    <nav
      className="md:hidden flex-shrink-0 bg-white border-t border-black/7 z-20"
      style={{ height: "var(--bottom-nav-height)" }}
    >
      <div className="flex h-full">
        {BOTTOM_TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors duration-150"
              style={{
                color: active
                  ? "var(--color-accent)"
                  : "var(--color-text-tertiary)",
              }}
            >
              <div className="relative">
                <Icon size={21} strokeWidth={active ? 2 : 1.75} />
                {item.badge && (
                  <span
                    className="absolute -top-1 -right-2 w-2 h-2 rounded-full border-[1.5px] border-white"
                    style={{ background: "var(--color-danger)" }}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={toggle}
          className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150"
          style={{ color: "var(--color-text-tertiary)" }}
          aria-label="More"
        >
          <MoreHorizontal size={21} strokeWidth={1.75} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
