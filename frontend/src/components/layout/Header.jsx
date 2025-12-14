"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Bell } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/store/useProfile";
import CartDrawer from "../cart/CartDrawer";
import { ThemeToggle } from "../darkModeButton";
import { useStoreStore } from "@/store/useStore";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { user, signOut , loading} = useAuthStore();
  const {profile} = useProfile()
  const {store, fetchStore} = useStoreStore();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const handleStoreDashboardNav = async () => {
    await fetchStore(user.id);
    // console.log(user)
    console.log(store);
    // console.log(profile.stores);
    if(store){
      router.push("/store/dashboard")
    } else router.push("/");
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shopping" },
    { name: "Stores", href: "/stores" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-muted/40 backdrop-blur-md border-b border-gray-100 dark:border-none shadow-sm">
      <div className="mx-auto flex justify-between items-center px-4 py-3 lg:py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          Corn<span className="text-corn-500">Mart</span>
        </Link>

        {/* Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-primary"
                  : "text-gray-600 hover:text-primary/90"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!user && !loading ? (
            <>
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => router.push("/auth/login")}
              >
                Login
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => router.push("/auth/signup")}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {/* Cart icon */}
              <CartDrawer />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/notifications")}
                className="hover:text-primary"
              >
                <Bell size={22} />
              </Button>

              {/* User avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer border border-gray-200">
                    <AvatarImage
                      src={profile?.avatar_url || ""}
                      alt="User avatar"
                    />
                    <AvatarFallback>
                      <User className="text-gray-600" size={18} />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    {profile?.full_name || "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/myorders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleStoreDashboardNav}>
                    Store
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-primary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-background/90 border-t border-chart-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-4 py-2 text-sm font-medium ${
                pathname === link.href
                  ? "text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
