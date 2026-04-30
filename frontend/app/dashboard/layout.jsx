import { DM_Sans } from "next/font/google";
// import "./globals.css";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Providers } from "@/components/providers/Providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Corn Mart — Dashboard",
  description: "E-commerce store management dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <Providers>
          <DashboardShell>{children}</DashboardShell>
        </Providers>
      </body>
    </html>
  );
}
