"use client";
// client/hooks/useStoreMessages.js
// ─────────────────────────────────────────────────────────────
// REALTIME STRATEGY
// ─────────────────────────────────────────────────────────────
// Views cannot be subscribed to directly (no WAL events).
// The trigger `trg_update_conversation_last_message` fires an
// UPDATE on the `conversations` TABLE on every message INSERT.
//
// So we subscribe to:
//   conversations UPDATE where store_id = storeId
//     → triggers mutate() on the list (re-fetches the view)
//
//   messages INSERT where conversation_id = X
//     → appends new messages to the open chat panel
//
// This gives us:
//   ✓ Conversation list re-sorts when a new message arrives
//   ✓ Unread count on the list row updates (view re-queried)
//   ✓ New messages appear in the chat instantly
//   ✓ The store_id filter means we only react to THIS store's events
// ─────────────────────────────────────────────────────────────

import useSWR, { mutate as globalMutate } from "swr";
import { useState, useCallback, useEffect, useRef } from "react";
import { apiClient, swrFetcher } from "@/lib/api/client";
import { ApiError }              from "@/lib/api/errors";
import { toast }                 from "@/lib/store/toastStore";
import useAuthStore              from "@/lib/store/useAuthStore";
import { supabase }              from "@/lib/supabaseClient";

const SWR_OPTS = {
  revalidateOnFocus:  true,
  keepPreviousData:   true,
  shouldRetryOnError: false,
};

// ── useStoreConversations ─────────────────────────────────────

export function useStoreConversations(filters = {}) {
  const storeId = useAuthStore(s => s.storeId);

  const key = storeId ? [
    `/stores/${storeId}/conversations`,
    {
      page:   filters.page   ?? 1,
      limit:  filters.limit  ?? 30,
      status: filters.status ?? "all",
      search: filters.search || undefined,
    },
  ] : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key, swrFetcher, { ...SWR_OPTS, refreshInterval: 60_000 }
  );

  useEffect(() => {
    if (!storeId) return;

    // Subscribe to conversations UPDATE (not messages INSERT).
    //
    // WHY: The trigger UPDATEs conversations.last_message_at every time
    // a message is inserted. That UPDATE has the store_id column so we
    // can filter to this store only. Subscribing to messages INSERT
    // would fire for every message on the entire platform.
    const channel = supabase
      .channel(`store-conv-list-${storeId}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",            // the trigger fires an UPDATE
          schema: "public",
          table:  "conversations",     // real table — has WAL events
          filter: `store_id=eq.${storeId}`,  // scoped to this store
        },
        () => {
          // Re-fetch the view — unread counts, last_message_body, sort order
          mutate();
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === "development") {
          console.debug(`[messages] store-conv-list channel: ${status}`);
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [storeId, mutate]);

  return {
    // data?.data matches the view columns:
    // id, store_id, customer_id, topic, status, last_message_at,
    // customer_name, customer_avatar, customer_email, customer_phone,
    // last_message_body, last_message_sender, last_message_created_at,
    // unread_count
    conversations: data?.data        ?? [],
    total:         data?.meta?.total ?? 0,
    isLoading,
    isRefreshing:  isValidating && !isLoading,
    error,
    mutate,
  };
}

// ── useStoreConversation ──────────────────────────────────────

export function useStoreConversation(conversationId) {
  const storeId = useAuthStore(s => s.storeId);

  const key = storeId && conversationId
    ? [`/stores/${storeId}/conversations/${conversationId}`, {}]
    : null;

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, SWR_OPTS);

  const [sending,       setSending]       = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const markedRef = useRef(false);

  const conversation = data?.data ?? null;

  // Merge DB messages with optimistic local ones.
  // Filter out any localMessages whose id now appears in the server list
  // (i.e. the Realtime event arrived before localMessages was cleared).
  const serverMessages  = conversation?.messages ?? [];
  const serverIds       = new Set(serverMessages.map(m => m.id));
  const pendingLocals   = localMessages.filter(m => !serverIds.has(m.id));
  const messages        = [...serverMessages, ...pendingLocals];

  // Mark customer messages as read once when conversation is opened
  useEffect(() => {
    if (!conversation || !storeId || markedRef.current) return;
    markedRef.current = true;
    apiClient
      .patch(`/stores/${storeId}/conversations/${conversationId}/read`, {})
      .catch(() => { /* non-fatal */ });
  }, [conversation, storeId, conversationId]);

  // Realtime: subscribe to new messages in this specific conversation
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`store-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new;

          // Only append messages from the OTHER side (customer/system).
          // Store's own messages are already in localMessages as optimistic entries
          // and will be reconciled when their id appears in serverMessages.
          if (msg.sender_type === "store") return;

          setLocalMessages(prev => {
            // Strict deduplication — never add the same id twice
            if (prev.some(m => m.id === msg.id)) return prev;

            // Guard against Realtime delivering a message that's already
            // been included in a fresh SWR fetch (race between Realtime
            // and the periodic refresh)
            if (serverIds.has(msg.id)) return prev;

            return [...prev, msg];
          });
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === "development") {
          console.debug(`[messages] store-chat channel: ${status}`);
        }
      });

    return () => { supabase.removeChannel(channel); };

  // serverIds intentionally excluded — it's derived and changes every render.
  // We only want to re-subscribe when the conversationId changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Reset when switching conversations
  useEffect(() => {
    setLocalMessages([]);
    markedRef.current = false;
  }, [conversationId]);

  // ── sendMessage ────────────────────────────────────────────
  const sendMessage = useCallback(async ({ body, orderId } = {}) => {
    if (!storeId || !conversationId || !body?.trim()) return null;
    setSending(true);

    const tempId = `optimistic-${Date.now()}`;

    // Append optimistic message immediately
    const optimistic = {
      id:              tempId,
      conversation_id: conversationId,
      sender_id:       null,
      sender_type:     "store",
      type:            "text",
      body:            body.trim(),
      order_id:        orderId ?? null,
      is_read:         true,
      created_at:      new Date().toISOString(),
      _optimistic:     true,
    };
    setLocalMessages(prev => [...prev, optimistic]);

    try {
      const result = await apiClient.post(
        `/stores/${storeId}/conversations/${conversationId}/messages`,
        { body: body.trim(), order_id: orderId ?? null }
      );

      // Replace the temp entry with the real DB row
      const confirmed = result?.data;
      setLocalMessages(prev =>
        confirmed
          ? prev.map(m => m.id === tempId ? confirmed : m)
          : prev.filter(m => m.id !== tempId)
      );

      // Nudge the conversation list so last_message_at re-sorts
      // (The trigger will fire a Realtime UPDATE which does this anyway,
      //  but this gives instant feedback if Realtime is slow.)
      globalMutate(
        k => Array.isArray(k) && k[0]?.startsWith(`/stores/${storeId}/conversations`) && k[0] !== `/stores/${storeId}/conversations/${conversationId}`,
        undefined,
        { revalidate: true }
      );

      return confirmed ?? null;
    } catch (err) {
      // Rollback
      setLocalMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error(err instanceof ApiError ? err.message : "Failed to send message");
      return null;
    } finally {
      setSending(false);
    }
  }, [storeId, conversationId]);

  // ── updateStatus ──────────────────────────────────────────
  const updateStatus = useCallback(async (status) => {
    if (!storeId || !conversationId) return;
    try {
      await apiClient.patch(
        `/stores/${storeId}/conversations/${conversationId}/status`,
        { status }
      );
      mutate();
      toast.success(`Conversation marked as ${status}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }, [storeId, conversationId, mutate]);

  // ── markAllRead ───────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    if (!storeId || !conversationId) return;
    await apiClient
      .patch(`/stores/${storeId}/conversations/${conversationId}/read`, {})
      .catch(() => { /* non-fatal */ });
  }, [storeId, conversationId]);

  return {
    conversation,
    messages,
    isLoading,
    error,
    mutate,
    sending,
    sendMessage,
    updateStatus,
    markAllRead,
  };
}

// ── useQuickReplies ───────────────────────────────────────────

export function useQuickReplies() {
  const storeId = useAuthStore(s => s.storeId);
  const key = storeId ? [`/stores/${storeId}/quick-replies`, {}] : null;

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, SWR_OPTS);
  const [loading, setLoading] = useState(false);

  const createReply = useCallback(async ({ label, body }) => {
    if (!storeId) return null;
    setLoading(true);
    try {
      const result = await apiClient.post(`/stores/${storeId}/quick-replies`, { label, body });
      mutate();
      toast.success("Quick reply saved");
      return result?.data ?? null;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save quick reply");
      return null;
    } finally { setLoading(false); }
  }, [storeId, mutate]);

  const updateReply = useCallback(async (id, payload) => {
    if (!storeId) return null;
    setLoading(true);
    try {
      const result = await apiClient.patch(`/stores/${storeId}/quick-replies/${id}`, payload);
      mutate();
      toast.success("Quick reply updated");
      return result?.data ?? null;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update quick reply");
      return null;
    } finally { setLoading(false); }
  }, [storeId, mutate]);

  const deleteReply = useCallback(async (id) => {
    if (!storeId) return false;
    setLoading(true);
    try {
      await apiClient.delete(`/stores/${storeId}/quick-replies/${id}`);
      mutate();
      toast.success("Quick reply deleted");
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete quick reply");
      return false;
    } finally { setLoading(false); }
  }, [storeId, mutate]);

  return {
    replies: data?.data ?? [],
    isLoading,
    error,
    loading,
    mutate,
    createReply,
    updateReply,
    deleteReply,
  };
}

// ── useStoreUnreadCount ───────────────────────────────────────
// Total unread count for the nav badge.
// Derives from the conversation list — no extra endpoint needed.

export function useStoreUnreadCount() {
  const storeId = useAuthStore(s => s.storeId);

  // Fetch ALL open conversations (high limit) to sum unread counts
  const key = storeId
    ? [`/stores/${storeId}/conversations`, { page: 1, limit: 100, status: "open" }]
    : null;

  const { data } = useSWR(key, swrFetcher, {
    ...SWR_OPTS,
    refreshInterval: 60_000,
  });

  const count = (data?.data ?? []).reduce(
    (sum, c) => sum + (c.unread_count ?? 0), 0
  );

  // Realtime bump — subscribe to the same conversations UPDATE event
  // as the list hook so the badge updates without polling
  const { mutate } = useSWR(key);
  useEffect(() => {
    if (!storeId) return;
    const channel = supabase
      .channel(`store-unread-badge-${storeId}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "conversations",
          filter: `store_id=eq.${storeId}`,
        },
        () => { mutate(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [storeId, mutate]);

  return count;
}