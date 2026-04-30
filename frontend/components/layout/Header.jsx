"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { useDrawer } from "@/lib/DrawerContext";
import { NAV_ITEMS } from "@/lib/nav";
import { NotifDrawer } from "../notifications/NotifDrawer";
import { useState } from "react";
import { useProfile } from "@/lib/store/useProfile";
import { ChevronDown } from "lucide-react";
import { Home } from "lucide-react";
import useAuthStore from "@/lib/store/useAuthStore";
import { LucideShoppingBag } from "lucide-react";
import Link from "next/link";

function getPageTitle(pathname) {
  const match = NAV_ITEMS.find((n) => pathname.startsWith(n.href));
  return match?.label ?? "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const [notifOpen, setNotif] = useState(false);
  const [userMenuOpen, setUser] = useState(false);
  const { user, storeId, isAuthenticated, signOut } = useAuthStore();
  const { profile } = useProfile();
  const { toggle } = useDrawer();
  const title = getPageTitle(pathname);

  return (
    <header
      className="flex items-center gap-3 px-4 md:px-5 bg-white border-b border-black/7 flex-shrink-0 z-10"
      style={{ height: "var(--header-height)" }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={toggle}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
        style={{ color: "var(--color-text-secondary)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-bg)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <h1
        className="text-[15px] font-semibold flex-1 tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={() => setNotif(true)}
          className="relative flex items-center justify-center w-8 h-8 rounded-lg border transition-colors duration-150"
          style={{
            borderColor: "var(--color-border-md)",
            color: "var(--color-text-secondary)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--color-bg)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border-[1.5px] border-white"
            style={{ background: "var(--color-danger)" }}
          />
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setUser((v) => !v)}
            className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
          >
            {profile?.avatar_url ? (
              <img
                src={profile?.avatar_url}
                alt="dp"
                className="w-7 h-7 rounded bg-[var(--color-primary)] flex items-center justify-center"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white text-[10px] font-bold">
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}

            <ChevronDown size={13} />
          </button>
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10 w-56"
                onClick={() => setUser(false)}
              />
              <div className="absolute right-0 top-11 bg-white rounded-2xl border border-[var(--color-border)] shadow-xl z-20 w-44 py-1 overflow-hidden">
                {[
                  { href: `/marketplace/stores/${storeId}`, Icon: LucideShoppingBag, label: "Storefront" },
                ].map(({ href, Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setUser(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <Icon size={14} /> {label}
                  </Link>
                ))}
                {
                  <Link
                    href={"/"}
                    onClick={() => setUser(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <Home size={14} /> {"Corn Mart"}
                  </Link>
                }
              </div>
            </>
          )}
        </div>
      </div>
      <NotifDrawer open={notifOpen} onClose={() => setNotif(false)} />
    </header>
  );
}
