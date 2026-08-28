"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingCart,
  Bell,
  Search,
  Menu,
  X,
  User,
  Package,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import useAuthStore from "@/lib/store/useAuthStore";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useBuyerUnreadCount } from "@/lib/hooks/useBuyerMessages";
import { NotifDrawer } from "@/components/notifications/NotifDrawer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/store/useProfile";
import { LayoutDashboard } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { useStoreUnreadCount } from "@/lib/hooks/useStoreMessages";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/marketplace/stores", label: "Stores" },
  { href: "/orders", label: "My Orders" },
  { href: "/onboarding", label: "Start Selling" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobile] = useState(false);
  const [notifOpen, setNotif] = useState(false);
  const [userMenuOpen, setUser] = useState(false);

  const toggleCart = useCartStore((s) => s.toggleCart);
  // s.count() is a function-on-state getter — calling it inside the
  // selector makes Zustand re-render the navbar whenever items change.
  const cartCount  = useCartStore((s) => s.count());
  const { unread: unreadNotifs } = useNotifications();
  const { user, storeId, isAuthenticated, signOut } = useAuthStore();
  const { profile } = useProfile();
  const buyerUnreadCount = useBuyerUnreadCount();
  const count = useStoreUnreadCount();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(
        `/marketplace/products?search=${encodeURIComponent(search.trim())}`
      );
      setSearch("");
      setMobile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[var(--color-border)] h-16 flex items-center">
        <div className="mx-auto w-full px-4 md:px-6 flex items-center gap-3 md:gap-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <Image src={"/icon0.svg"} width={800} height={800} size={16} className="text-white" />
            </div>
            {/* <span className="text-[16px] font-bold text-[var(--color-text-primary)] lowercase hidden sm:block">
              corn mart
            </span> */}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5 flex-shrink-0">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap",
                  pathname.startsWith(l.href)
                    ? "text-[var(--color-text-primary)] after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[1px] after:h-[2px] after:bg-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex-1 min-w-0 hidden md:block max-w-[220px] lg:max-w-md"
          >
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            {/* Notifications — hidden on very narrow screens to avoid the
                action cluster overflowing past the hamburger menu; still
                reachable from the account dropdown once signed in. */}
            <button
              onClick={() => setNotif(true)}
              className="hidden sm:flex relative w-9 h-9 rounded-full items-center justify-center hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
            >
              <Bell size={18} />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUser((v) => !v)}
                  className="flex items-center gap-1.5 h-9 px-2 rounded-full hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
                >
                  {(count > 0 || buyerUnreadCount > 0) && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>
                  )}
                  {profile.avatar_url ? (
                    <img
                      src={profile?.avatar_url}
                      alt="dp"
                      className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-[10px] font-bold">
                      {user?.email?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}

                  <ChevronDown size={13} />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUser(false)}
                    />
                    <div className="absolute right-0 top-11 bg-white rounded-2xl border border-[var(--color-border)] shadow-xl z-20 w-44 py-1 overflow-hidden">
                      {[
                        {
                          href: "/account/notifications",
                          Icon: Bell,
                          label: "Notifications",
                        },
                        { href: "/orders", Icon: Package, label: "My Orders" },
                        {
                          href: "/account/messages",
                          Icon: MessageSquare,
                          label: "Messages",
                        },
                      ].map(({ href, Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUser(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          <Icon size={14} /> {label}
                          {label === "Messages" && buyerUnreadCount > 0 && (
                            <span className="ml-auto w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                              {buyerUnreadCount > 9 ? "9+" : buyerUnreadCount}
                            </span>
                          )}
                        </Link>
                      ))}
                      {
                        <Link
                          href={"/dashboard"}
                          onClick={() => setUser(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          <LayoutDashboard size={14} /> {"Dashboard"}
                          {count > 0 && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>
                          )}
                        </Link>
                      }
                      <div className="border-t border-[var(--color-border)] my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/sign-in">
                <button className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
                  Sign in
                </button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobile((v) => !v)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-[var(--color-border)] shadow-lg z-30 px-4 py-4 space-y-2 lg:hidden max-h-[calc(100vh-64px)] overflow-y-auto">
            <form onSubmit={handleSearch} className="relative mb-3 md:hidden">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-primary)]"
              />
            </form>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobile(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors",
                  pathname.startsWith(l.href)
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary-text)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                )}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobile(false);
                setNotif(true);
              }}
              className="sm:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <Bell size={15} />
              Notifications
              {unreadNotifs > 0 && (
                <span className="ml-auto w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Drawers */}
      <CartDrawer />
      <NotifDrawer open={notifOpen} onClose={() => setNotif(false)} />
    </>
  );
}
