// hooks/useNotifications.js
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "sonner";

export default function useNotifications(userId) {
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!userId) return;

    console.log(userId)

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addNotification(payload.new);
          toast.success(payload.new.message || "New notification");
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addNotification(payload.new);
          toast("Notification updated");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addNotification]);
}
