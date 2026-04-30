"use client";

import {
  LayoutGrid,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  Palette,
  MessageSquare,
  Settings,
} from "lucide-react";

/**
 * Primary nav — shown in sidebar (desktop) and bottom tab bar (mobile).
 * `bottomTab: true` means it appears in the 4-slot mobile bottom bar.
 * Items without bottomTab go into the mobile "More" drawer.
 */
export const NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    href: "/dashboard/overview",
    icon: LayoutGrid,
    bottomTab: true,
    section: "main",
  },
  {
    key: "products",
    label: "Products",
    href: "/dashboard/products",
    icon: ShoppingBag,
    bottomTab: true,
    section: "main",
  },
  {
    key: "orders",
    label: "Orders",
    href: "/dashboard/orders",
    icon: ClipboardList,
    bottomTab: true,
    badge: 4,
    section: "main",
  },
  {
    key: "sales",
    label: "Sales",
    href: "/dashboard/sales",
    icon: TrendingUp,
    bottomTab: false,
    section: "main",
  },
   {
     key: "coming",
     label: "Coming Soon",
     href: "#",
     icon: Palette,
     bottomTab: false,
     section: "store",
   },
  // {
  //   key: "branding",
  //   label: "Branding",
  //   href: "/dashboard/branding",
  //   icon: Palette,
  //   bottomTab: false,
  //   section: "store",
  // },
  // {
  //   key: "messages",
  //   label: "Messages",
  //   href: "/dashboard/messages",
  //   icon: MessageSquare,
  //   bottomTab: true,
  //   badge: 7,
  //   section: "store",
  // },
  // {
  //   key: "settings",
  //   label: "Settings",
  //   href: "/dashboard/settings",
  //   icon: Settings,
  //   bottomTab: false,
  //   section: "store",
  // },
];

export const BOTTOM_TAB_ITEMS = NAV_ITEMS.filter((n) => n.bottomTab);
export const DRAWER_ITEMS = NAV_ITEMS.filter((n) => !n.bottomTab);

export const SECTION_LABELS = {
  main: "Main",
  store: "Store",
};
