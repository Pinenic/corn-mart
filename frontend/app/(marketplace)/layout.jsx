import "./globals.css";
// import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import NextTopLoader from "nextjs-toploader";

export const metadata = {
  title: "Corn Mart — Marketplace",
  description: "Discover and shop from independent stores",
};

export default function MarketplaceLayout({ children }) {
  return (
    <>
      <NextTopLoader
        color="var(--color-gold)"
        height={3}
        showSpinner={false}
        shadow={false}
      />
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
      <Footer />
    </>
  );
}
