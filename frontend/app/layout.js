import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

// const inter = Inter({ 
//   subsets: ["latin"], 
//   variable: "--font-sans", 
//   display: "swap" 
// });

export const metadata = {
  title: "Corn Mart",
  description: "Online Shopping",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
