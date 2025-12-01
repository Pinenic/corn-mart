"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

export default function Layout({ children }) {
  return (
    <div className="min-h-[100vh] md:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar variant="inset" />
      {/* Main Content Area */}
      <div className={`flex-1`}>
        {/* Header */}
          <SiteHeader />
          {/* Page Content */}
        <div className="p-1 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
