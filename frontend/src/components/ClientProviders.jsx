"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Header from "@/components/layout/Header";
import ToasterProvider from "@/components/ToasterProvider";
import { ThemeProvider } from "@/components/theme-provider";

export default function ClientProviders({ children }) {
  const { init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Header />
      <ToasterProvider />
      <main className="flex-1">{children}</main>
      {/* Footer can go here later */}
    </ThemeProvider>
  );
}
