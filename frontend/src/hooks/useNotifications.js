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

// {"timestamp": "2025-12-23T13:37:18.494134+00:00", "new_status": "processing", "old_status": "pending", "store_order_id": "b154276a-c943-4d70-9c43-4329d436d358"}