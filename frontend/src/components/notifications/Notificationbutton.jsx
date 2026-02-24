"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationStore } from "@/store/useNotificationStore";
import { supabase } from "@/lib/supabaseClient";
import { getBuyerNotifications, viewAll } from "@/lib/notificationsApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useRef } from "react";
import useNotificationsRealtime from "@/hooks/useNotificationsRealtime";

export default function NotificationBell({ user }) {
  const { notifications, unreadCount, setNotifications, markAllViewed } =
    useNotificationStore();
  const channelRef = useRef(null);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const updateNotification = useNotificationStore((s) => s.updateNotification);

  const fetchNotifications = async () => {
    try {
      const data = await getBuyerNotifications(user?.id);
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = async () => {
    if (!unreadCount) return;

    // update DB
    await viewAll(user?.id);

    markAllViewed();
  };
  useNotificationsRealtime(user?.id);

  useEffect(() => {
    fetchNotifications();
    console.log(notifications);
  }, [user]);

  useEffect(() => {
      if (!user?.id) return;
  
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
  
      const channel = supabase
        .channel(`notifications-${user?.id}`)
  
        // NEW
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user?.id}`,
          },
          (payload) => addNotification(payload.new)
        )
  
        // UPDATED
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user?.id}`,
          },
          (payload) => updateNotification(payload.new)
        )
  
        .subscribe();
  
      channelRef.current = channel;
  
      return () => supabase.removeChannel(channel);
    }, [user]);

  return (
    <DropdownMenu onOpenChange={(open) => open && handleOpen()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 border-b ${!n.is_read ? "bg-muted/40" : ""}`}
            >
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
