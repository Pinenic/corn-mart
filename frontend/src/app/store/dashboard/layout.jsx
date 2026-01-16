"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { useStoreStore } from "@/store/useStore";


export default function Layout({ children }) {
  const {store} = useStoreStore();
  return (
    <div className="h-[90vh] sticky top-20 md:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar store_name={store?.name} id={store?.id}/>
      {/* Main Content Area */}
      <div className={`grow`}>
        {/* Header */}
        {/* <SiteHeader /> */}
        {/* Page Content */}
        <div className="p-1 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
