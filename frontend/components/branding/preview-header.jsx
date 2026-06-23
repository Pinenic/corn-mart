"use client";

import { useBranding } from "@/lib/branding-context";
import { ShoppingCart, Search, Menu, User } from "lucide-react";

export function PreviewHeader() {
  const { config } = useBranding();
  const { layout, showCart, showSearch } = config.header;

  const Logo = () => (
    <div className="font-bold text-lg tracking-tight">STOREFRONT</div>
  );

  const Nav = () => (
    <nav className="hidden md:flex items-center gap-6 text-sm">
      <span className="hover:text-primary cursor-pointer transition-colors">
        Shop
      </span>
      <span className="hover:text-primary cursor-pointer transition-colors">
        Collections
      </span>
      <span className="hover:text-primary cursor-pointer transition-colors">
        About
      </span>
      <span className="hover:text-primary cursor-pointer transition-colors">
        Contact
      </span>
    </nav>
  );

  const Icons = () => (
    <div className="flex items-center gap-3">
      {showSearch && (
        <Search className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
      )}
      {showCart && (
        <ShoppingCart className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
      )}
      <User className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
    </div>
  );

  if (layout === "logo-left") {
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <Logo />
        <Nav />
        <Icons />
      </header>
    );
  }

  if (layout === "logo-center") {
    return (
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="w-24" />
          <Logo />
          <Icons />
        </div>
        <div className="flex justify-center pb-4">
          <Nav />
        </div>
      </header>
    );
  }

  if (layout === "minimal") {
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <Logo />
        <Icons />
      </header>
    );
  }

  if (layout === "sidebar-style") {
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Menu className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
          <Logo />
        </div>
        <Icons />
      </header>
    );
  }

  if (layout === "transparent-overlay") {
    return (
      <header className="flex items-center justify-between px-6 py-4 bg-transparent absolute top-0 left-0 right-0 z-10">
        <Logo />
        <Nav />
        <Icons />
      </header>
    );
  }

  return null;
}
