import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Navbar }    from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata = {
  title:       "Corn Mart — Marketplace",
  description: "Discover and shop from independent stores",
};

export default function MarketplaceLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </>
  );
}
