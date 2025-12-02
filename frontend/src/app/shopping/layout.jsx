"use client";

import { useState } from "react";
import { Menu, Sidebar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import CategorySidebar from "./components/CategorySidebar";

export default function Layout({ children }) {
  return (
    <section className="flex flex-col md:flex-row gap-4 w-full">

      {/* === MOBILE/TABLET DRAWER BUTTON === */}
      <div className="md:hidden px-3 py-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex">
              <Sidebar size={18} />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Categories</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <CategorySidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* === DESKTOP SIDEBAR === */}
      <div className="hidden md:block max-h-[90vh] w-64">
        <CategorySidebar />
      </div>

      {/* === PAGE CONTENT === */}
      <div className="flex-1">{children}</div>
    </section>
  );
}
