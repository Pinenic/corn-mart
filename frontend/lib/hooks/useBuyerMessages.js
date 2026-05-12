"use client";
// client/hooks/useBuyerMessages.js
// ─────────────────────────────────────────────────────────────
// Hooks for the buyer-side marketplace messages module.
//
// Architecture:
//   - SWR for conversation list and individual conversation data
//   - Supabase Realtime for live new messages from the store
//   - Optimistic local appends when the buyer sends a message
//   - Idempotent conversation start (upsert — one thread per store)
//
// Usage — conversation list:
//
//   const { conversations, total, isLoading, mutate } =
//     useBuyerConversations();
//
// Usage — open conversation:
//
//   const {
//     conversation, messages, isLoading,
//     sendMessage, sending,
//   } = useBuyerConversation(conversationId);
//
// Usage — start a conversation from a product/store page:
//
//   const { startConversation, starting } = useStartConversation();
//
//   const conv = await startConversation({
//     storeId: "...",
//     topic:   "Question about Air Runner Pro",
//     body:    "Do you have size 42 in navy?",
//     orderId: null,
//   });
//   if (conv) router.push(`/account/messages/${conv.id}`);
// ─────────────────────────────────────────────────────────────

import useSWR from "swr";
import { useState, useCallback, useEffect, useRef } from "react";
import { apiClient, swrFetcher } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { toast } from "@/lib/store/toastStore";
import useAuthStore from "@/lib/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";

const SWR_OPTS = {
  revalidateOnFocus: true,
  keepPreviousData: true,
  shouldRetryOnError: false,
};

// ── useBuyerConversations ─────────────────────────────────────
// All conversations for the authenticated buyer, sorted by
// most recent activity. Polls every 30s as a Realtime fallback.
export function useBuyerConversations(filters = {}) {
  const token = useAuthStore((s) => s.token);

  const key = token
    ? [
        "/marketplace/conversations",
        {
          page: filters.page ?? 1,
          limit: filters.limit ?? 30,
        },
      ]
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    swrFetcher,
    { ...SWR_OPTS, refreshInterval: 30_000 }
  );

  // Realtime: revalidate the list when a new message arrives in any
  // of this buyer's conversations (last_message_at changes → resort).
  const userId = useAuthStore((s) => s.user?.id);
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`buyer-conversations-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    conversations: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error,
    mutate,
  };
}

// ── useBuyerConversation ──────────────────────────────────────
// Single conversation with full message history.
// Realtime subscription appends new store messages without a refetch.
export function useBuyerConversation(conversationId) {
  const token = useAuthStore((s) => s.token);

  const key =
    token && conversationId
      ? [`/marketplace/conversations/${conversationId}`, {}]
      : null;

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, SWR_OPTS);

  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);

  const markedRef = useRef(false);

  const conversation = data?.data ?? null;
  // Merge DB messages with optimistic local ones.
  // Filter out any localMessages whose id now appears in the server list
  // (i.e. the Realtime event arrived before localMessages was cleared).
  const serverMessages = conversation?.messages ?? [];
  const serverIds = new Set(serverMessages.map((m) => m.id));
  const pendingLocals = localMessages.filter((m) => !serverIds.has(m.id));
  const messages = [...serverMessages, ...pendingLocals];

  // Mark store messages as read once when conversation is opened
  useEffect(() => {
    if (!conversation || markedRef.current) return;
    markedRef.current = true;
    
    // Optimistically mark all messages as read
    mutate(prev => {
      if (!prev?.data) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          messages: (prev.data.messages || []).map(m => ({
            ...m,
            is_read: true
          }))
        }
      };
    }, false);
    
    apiClient
      .patch(`/marketplace/conversations/${conversationId}/read`, {})
      .catch(() => {
        // Revalidate to restore accurate state on error
        mutate();
      });
  }, [conversation, conversationId, mutate]);

  // Realtime: append new messages from the store live
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`buyer-conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new;
          // Append store and system messages — buyer's own are already
          // in localMessages from the optimistic update.
          if (msg.sender_type !== "customer") {
            setLocalMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              if (serverIds.has(msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Reset local messages when switching conversations
  useEffect(() => {
    setLocalMessages([]);
    markedRef.current = false;
  }, [conversationId]);

  // ── sendMessage ──────────────────────────────────────────────
  const sendMessage = useCallback(
    async ({ body, reference, orderId } = {}) => {
      // console.log(body);
      if (!conversationId || !body?.trim()) return null;
      setSending(true);

      // Optimistic append — gives the buyer instant feedback
      const optimistic = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_type: "customer",
        type: "text",
        body: body.trim(),
        order_id: orderId ?? null,
        reference: reference ?? null,
        is_read: false,
        created_at: new Date().toISOString(),
        _optimistic: true,
      };
      setLocalMessages((prev) => [...prev, optimistic]);

      try {
        console.log("debug break1");
        const result = await apiClient.post(
          `/marketplace/conversations/${conversationId}/messages`,
          { body: body.trim(), reference: reference ?? null, order_id: orderId ?? null }
        );
        // Replace the optimistic entry with the confirmed DB row
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? result?.data ?? m : m))
        );
        return result?.data ?? null;
      } catch (err) {
        // Rollback
        setLocalMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        toast.error(
          err instanceof ApiError ? err.message : "Failed to send message"
        );
        return null;
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  return {
    conversation,
    messages,
    isLoading,
    error,
    mutate,
    sending,
    sendMessage,
  };
}

// ── useStartConversation ──────────────────────────────────────
// Creates or retrieves an existing conversation with a store.
// Safe to call multiple times — the backend upserts on (store_id, customer_id).
//
// Typical call sites:
//   - "Message seller" button on a product detail page
//   - "Contact store" button on a store profile page
//   - Order detail page ("Ask about this order")
export function useStartConversation() {
  const token = useAuthStore((s) => s.token);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const startConversation = useCallback(
    async ({ storeId, topic = null, body = null, orderId = null }) => {
      if (!token) {
        toast.info("Please sign in to message the seller");
        return null;
      }

      setStarting(true);
      setError(null);

      try {
        const result = await apiClient.post("/marketplace/conversations", {
          store_id: storeId,
          topic: topic || null,
          body: body || null,
          order_id: orderId || null,
        });
        return result?.data ?? null;
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : "Could not start conversation";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setStarting(false);
      }
    },
    [token]
  );

  return { startConversation, starting, error };
}

// ── useBuyerUnreadCount ───────────────────────────────────────
// Total unread count for the buyer's nav badge.
// Derives from the conversation list — no extra endpoint needed.

export function useBuyerUnreadCount() {
  const token = useAuthStore((s) => s.token);

  // Fetch ALL open conversations (high limit) to sum unread counts
  const key = token
    ? ["/marketplace/conversations", { page: 1, limit: 40, status: "open" }]
    : null;

  const { data } = useSWR(key, swrFetcher, {
    ...SWR_OPTS,
    refreshInterval: 60_000,
  });

  const count = (data?.data ?? []).reduce(
    (sum, c) => sum + (c.unread_count ?? 0),
    0
  );

  // Realtime bump — subscribe to the same messages INSERT event
  // as the list hook so the badge updates without polling
  const userId = useAuthStore((s) => s.user?.id);
  const { mutate } = useSWR(key);
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`buyer-unread-badge-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          mutate();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, mutate]);

  return count;
}
