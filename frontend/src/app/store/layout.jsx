import AuthGuard from "@/components/auth/AuthGuard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({ children }) {
  return (
    <main>
      <AuthGuard>
        <SidebarProvider>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    </main>
  );
}
