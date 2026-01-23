import AuthGuard from "@/components/auth/AuthGuard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({ children }) {
  return (
    <main className="min-h-screen">
      <AuthGuard>
        <SidebarProvider>
          <SidebarInset className="min-h-screen">{children}</SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    </main>
  );
}
