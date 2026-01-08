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
import BackButton from "@/components/BackButton";

export default function Layout({ children }) {
  return (
    <section className="flex flex-col lg:flex-row gap-4 max-w-7xl m-auto">

      {/* === MOBILE/TABLET DRAWER BUTTON === */}
      <div className="flex justify-between lg:hidden px-3 pt-3">
        <BackButton />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex">
              <Sidebar size={18} />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-0">
            <div className="px-4">
              <CategorySidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* === DESKTOP SIDEBAR === */}
      <div className="hidden lg:block max-h-[90vh] w-64">
        <CategorySidebar />
      </div>

      {/* === PAGE CONTENT === */}
      <div className="md:flex-1">{children}</div>
    </section>
  );
}
