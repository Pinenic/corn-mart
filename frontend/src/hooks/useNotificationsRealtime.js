"use client";

import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { supabase } from "@/lib/supabaseClient";

export default function useNotificationsRealtime(userId) {
  const channelRef = useRef(null);
  const addNotification = useNotificationStore(s => s.addNotification);
  const updateNotification = useNotificationStore(s => s.updateNotification);

  useEffect(() => {
    if (!userId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`notifications-${userId}`)

      // NEW
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
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
          filter: `user_id=eq.${userId}`,
        },
        (payload) => updateNotification(payload.new)
      )

      .subscribe();

    channelRef.current = channel;

    return () => supabase.removeChannel(channel);
  }, [userId]);
}