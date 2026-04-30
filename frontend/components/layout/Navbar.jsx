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
import { useCart } from "@/lib/store/useCart";
import useAuthStore from "@/lib/store/useAuthStore";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { NotifDrawer } from "@/components/notifications/NotifDrawer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/store/useProfile";
import { LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/marketplace/stores", label: "Stores" },
  { href: "/orders", label: "My Orders" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobile] = useState(false);
  const [notifOpen, setNotif] = useState(false);
  const [userMenuOpen, setUser] = useState(false);

  const toggleCart = useCartStore((s) => s.toggleCart);
  const _cartCount = useCart((s) => s.count);
  const cartCount = _cartCount();
  const { notifications } = useNotifications();
  const { user, storeId, isAuthenticated, signOut } = useAuthStore();
  const { profile } = useProfile();

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
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <span className="text-[16px] font-bold text-[var(--color-text-primary)] hidden sm:block">
              Corn Mart
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors",
                  pathname.startsWith(l.href)
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary-text)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          {/* <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md hidden md:block"
          >
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands…"
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </form> */}

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Notifications */}
            <button
              onClick={() => setNotif(true)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
            >
              <Bell size={18} />
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
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
                  className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
                >
                  {profile.avatar_url ? (
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
                      className="fixed inset-0 z-10"
                      onClick={() => setUser(false)}
                    />
                    <div className="absolute right-0 top-11 bg-white rounded-2xl border border-[var(--color-border)] shadow-xl z-20 w-44 py-1 overflow-hidden">
                      {[
                        { href: "/orders", Icon: Package, label: "My Orders" },
                        {
                          href: "/account/notifications",
                          Icon: Bell,
                          label: "Notifications",
                        },
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
                          href={"/dashboard"}
                          onClick={() => setUser(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          <LayoutDashboard size={14} /> {"Dashboard"}
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
                <button className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
                  Sign in
                </button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobile((v) => !v)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-[var(--color-border)] shadow-lg z-30 px-4 py-4 space-y-2 md:hidden">
            <form onSubmit={handleSearch} className="relative mb-3">
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
          </div>
        )}
      </header>

      {/* Drawers */}
      <CartDrawer />
      <NotifDrawer open={notifOpen} onClose={() => setNotif(false)} />
    </>
  );
}
