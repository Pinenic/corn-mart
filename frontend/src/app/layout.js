"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import ToasterProvider from "@/components/ToasterProvider";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import {Analytics} from '@vercel/analytics';

import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  const { init, loading } = useAuthStore();
  
  useEffect(() => {
    init();
  }, [init]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Corn Mart</title>
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <ToasterProvider />
          <main className="flex-1">{children}</main>
          <Analytics />
          {/* <Footer /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}