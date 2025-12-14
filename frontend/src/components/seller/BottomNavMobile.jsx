"use client";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, BarChart2, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/store/dashboard", icon: LayoutDashboard },
  { href: "/store/orders", icon: ShoppingBag },
  { href: "/store/inventory", icon: Package },
  { href: "/store/analytics", icon: BarChart2 },
  { href: "/store/settings", icon: Settings },
];

export function BottomNavMobile() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 shadow-md">
      {navItems.map(({ href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center text-xs ${
            pathname === href ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <Icon className="w-5 h-5" />
        </Link>
      ))}
    </nav>
  );
}
