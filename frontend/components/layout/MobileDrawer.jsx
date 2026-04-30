"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useDrawer } from "@/lib/DrawerContext";

export function MobileDrawer() {
  const { isOpen, close } = useDrawer();
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href) => pathname.startsWith(href);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-opacity duration-250"
        style={{
          background: "rgba(0,0,0,0.32)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 left-0 bottom-0 z-50 md:hidden flex flex-col bg-white border-r border-black/7 transition-transform duration-250 ease-out"
        style={{
          width: 260,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          willChange: "transform",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 flex-shrink-0 border-b border-black/7"
          style={{ height: "var(--header-height)" }}
        >
          <div
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ width: 28, height: 28, background: "var(--color-accent)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span
            className="text-[15px] font-semibold tracking-tight flex-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            Corn Mart
          </span>
          <button
            onClick={close}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-bg)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* All nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors duration-150 relative"
                style={{
                  color: active
                    ? "var(--color-accent-text)"
                    : "var(--color-text-secondary)",
                  background: active ? "var(--color-accent-subtle)" : "transparent",
                }}
              >
                <Icon size={18} style={{ opacity: active ? 1 : 0.65, flexShrink: 0 }} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{ background: "var(--color-danger)", color: "#fff" }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          className="flex items-center gap-3 p-4 border-t border-black/7"
          style={{ background: "var(--color-bg)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{
              background: "var(--color-accent-subtle)",
              color: "var(--color-accent-text)",
            }}
          >
            SK
          </div>
          <div>
            <p
              className="text-[13px] font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              Store Admin
            </p>
            <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
              admin@storely.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
