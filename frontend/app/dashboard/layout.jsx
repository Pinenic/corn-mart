import { DM_Sans } from "next/font/google";
// import "./globals.css";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Providers } from "@/components/providers/Providers";
import DashboardGuard from "@/components/auth/DashboardGuard";
import NextTopLoader from "nextjs-toploader";

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
    <>
      {/* <NextTopLoader
        color="var(--color-primary)"
        height={3}
        showSpinner={false}
        shadow={false}
      /> */}
      <Providers>
        <DashboardGuard>
          <DashboardShell>{children}</DashboardShell>
        </DashboardGuard>
      </Providers>
    </>
  );
}
