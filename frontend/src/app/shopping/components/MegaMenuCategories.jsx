"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";

export default function MegaMenuCategories({ categories = [] }) {
  return (
    <NavigationMenu className="w-full hidden md:block lg:hidden">
      <NavigationMenuList className="w-full">
        <NavigationMenuItem className="w-full">
          {/* Trigger Button */}
          <NavigationMenuTrigger className="px-4 py-2">
            Categories
          </NavigationMenuTrigger>

          {/* FULL WIDTH DROPDOWN */}
          <NavigationMenuContent className=" w-full px-6 py-8 bg-background border shadow-lg">
            <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id}>
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      {Icon && <Icon size={16} className="opacity-70" />}
                      <Link
                        href={`/shopping/${cat.slug}`}
                        className="hover:underline"
                      >
                        {cat.name}
                      </Link>
                    </h3>

                    {cat.subcategories?.length ? (
                      <ul className="space-y-1">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/shopping/${cat.slug}/${sub.slug}`}
                              className="text-sm text-muted-foreground hover:text-primary"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No subcategories
                      </p>
                    )}
                  </div>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
