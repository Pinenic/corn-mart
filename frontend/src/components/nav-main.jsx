"use client";

import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({ items }) {
  const pathname = usePathname();
  const { isMobile, toggleSidebar } = useSidebar();

  const toggleMobileNav = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const active = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <Link
                  href={item.url}
                  className={`flex items-center gap-3 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-primary-foreground text-primary dark:bg-primary-foreground/10 dark:text-primary"
                      : "text-gray-600 hover:bg-transparent dark:text-gray-400 dark:hover:bg-transparent"
                  }`}
                   onClick={() => toggleMobileNav()}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`cursor-pointer ${
                      active
                        ? "hover:bg-primary-foreground/10 hover:text-primary"
                        : ""
                    }`}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
