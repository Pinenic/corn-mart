"use client";
import Link from "next/link";
import { LayoutDashboard, Package, BarChart, Settings, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/store/dashboard" },
  { name: "Orders", icon: ShoppingBag, href: "/store/orders" },
  { name: "Inventory", icon: Package, href: "/store/inventory" },
  { name: "Analytics", icon: BarChart, href: "/store/analytics" },
  { name: "Settings", icon: Settings, href: "/store/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Store Panel</h2>
      <nav className="space-y-2">
        {navItems.map(({ name, icon: Icon, href }) => (
          <Link
            key={name}
            href={href}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              pathname === href ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
