"use client";

import Link from "next/link";
import { useState } from "react";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function CategoryNav({ categories }) {
  return (
    <div className="w-full border-b bg-background">
      {/* Desktop */}
      <div className="hidden md:flex justify-center py-3">
        <NavigationMenu>
          <NavigationMenuList>
            {categories.map((cat) => (
              <NavigationMenuItem key={cat.id}>
                {cat.subcategories.length > 0 ? (
                  <>
                    <NavigationMenuTrigger>
                      {cat.name}
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <ul className="grid gap-2 p-4 w-56">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/category/${cat.slug}/${sub.slug}`}
                              className="block px-2 py-1 text-sm hover:bg-muted rounded-md"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link
                    href={`/category/${cat.slug}`}
                    className="px-3 py-2 text-sm hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile (Sheet) */}
      <div className="md:hidden px-4 py-2 flex justify-between items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Categories</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="font-medium text-base block"
                  >
                    {cat.name}
                  </Link>

                  {cat.subcategories.length > 0 && (
                    <div className="ml-3 mt-2 space-y-1">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${cat.slug}/${sub.slug}`}
                          className="block text-sm text-muted-foreground hover:text-primary"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
