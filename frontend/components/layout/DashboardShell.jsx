"use client";

import { DrawerProvider } from "@/lib/DrawerContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { MobileDrawer } from "./MobileDrawer";

/**
 * DashboardShell
 *
 * Layout grid:
 *
 * Desktop (≥768px):
 *   [Sidebar 220px] | [Header / Page content]
 *
 * Tablet (768px, sidebar collapses to icons via CSS):
 *   [Sidebar 56px] | [Header / Page content]
 *
 * Mobile (<768px):
 *   [Header]
 *   [Page content — scrollable]
 *   [Bottom tab bar 64px]
 *   + Slide-in drawer overlay
 */
export function DashboardShell({ children }) {
  return (
    <DrawerProvider>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "var(--color-bg)" }}
      >
        {/* Desktop/Tablet Sidebar */}
        <Sidebar />

        {/* Main column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Top header bar */}
          <Header />

          {/* Scrollable page area */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-6">
              {children}
            </div>
          </main>

          {/* Mobile bottom tab bar */}
          <BottomNav />
        </div>

        {/* Mobile slide-in drawer (portals above everything) */}
        <MobileDrawer />
      </div>
    </DrawerProvider>
  );
}
