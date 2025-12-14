import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({ children }) {
  return (
    <main>
      <SidebarProvider>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </main>
  );
}
