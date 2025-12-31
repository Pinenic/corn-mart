import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Analytics } from "@vercel/analytics/react";
import ClientProviders from "@/components/ClientProviders";

export const metadata = {
  title: "Corn Mart",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ClientProviders>
          {children}
        </ClientProviders>

        {/* Server-safe */}
        <Analytics />
      </body>
    </html>
  );
}
