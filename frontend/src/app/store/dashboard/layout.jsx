"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { useStoreStore } from "@/store/useStore";


export default function Layout({ children }) {
  const {store} = useStoreStore();
  return (
    <div className="flex flex-col sm:flex-row min-h-screen gap-0">
      {/* Sidebar and Backdrop */}
      <AppSidebar store_name={store?.name} id={store?.id}/>
      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-auto">
        {/* Page Content */}
        <div className="px-4 py-4 sm:px-6 sm:py-6 mx-auto max-w-(--breakpoint-2xl)">
          {children}
        </div>
      </div>
    </div>
  );
}
