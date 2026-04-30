"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SECTION_LABELS } from "@/lib/nav";
import { useStoreStore } from "@/lib/store/useStore";

const sections = ["main", "store"];

export function Sidebar() {
  const { store } = useStoreStore();
  const pathname = usePathname();

  const isActive = (href) => pathname.startsWith(href);

  return (
    <aside
      className="hidden md:flex flex-col bg-white border-r border-black/7 flex-shrink-0 transition-all duration-200"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 flex-shrink-0 border-b border-black/7"
        style={{ height: "var(--header-height)" }}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{
            width: 28,
            height: 28,
            background: "var(--color-accent)",
          }}
        >
          {store?.logo ? (
            <img
              src={store.logo}
              alt="logo"
              className="w-8 h-8 rounded-sm flex items-center justify-center"
            />
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
              <rect
                x="8"
                y="1"
                width="5"
                height="5"
                rx="1.5"
                fill="white"
                opacity="0.6"
              />
              <rect
                x="1"
                y="8"
                width="5"
                height="5"
                rx="1.5"
                fill="white"
                opacity="0.6"
              />
              <rect
                x="8"
                y="8"
                width="5"
                height="5"
                rx="1.5"
                fill="white"
                opacity="0.3"
              />
            </svg>
          )}
        </div>
        <span
          className="text-[15px] font-semibold tracking-tight sidebar-label-text"
          style={{ color: "var(--color-text-primary)" }}
        >
          {store?.name}
        </span>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sections.map((section) => {
          const items = NAV_ITEMS.filter((n) => n.section === section);
          return (
            <div key={section} className="mb-1">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest px-2 py-2 sidebar-label-text"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {SECTION_LABELS[section]}
              </p>
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors duration-150 group relative"
                    style={{
                      color: active
                        ? "var(--color-accent-text)"
                        : "var(--color-text-secondary)",
                      background: active
                        ? "var(--color-accent-subtle)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.background = "var(--color-bg)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon
                      size={17}
                      style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}
                    />
                    <span className="sidebar-label-text">{item.label}</span>
                    {/* {item.badge && (
                      <span
                        className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center sidebar-label-text"
                        style={{
                          background: "var(--color-danger)",
                          color: "#fff",
                        }}
                      >
                        {item.badge}
                      </span>
                    )} */}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      {/* <Link
        href="/settings"
        className="flex items-center gap-2.5 p-3 border-t border-black/7 transition-colors duration-150"
        style={{ color: "var(--color-text-secondary)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-bg)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{
            background: "var(--color-accent-subtle)",
            color: "var(--color-accent-text)",
          }}
        >
          SK
        </div>
        <div className="sidebar-label-text">
          <p
            className="text-[13px] font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Store Admin
          </p>
          <p
            className="text-[11px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Settings
          </p>
        </div>
      </Link> */}
    </aside>
  );
}
