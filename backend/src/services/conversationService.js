// src/services/conversationService.js
// ─────────────────────────────────────────────────────────────
// Queries the two views for list endpoints, raw tables for
// message sending and status updates.
//
// Field names in responses match the view columns exactly so the
// frontend ConvRow and ChatPanel components don't need mapping.
//
// store_conversations_with_details columns:
//   id, customer_id, store_id, topic, status,
//   last_message_at, created_at, updated_at,
//   customer_name, customer_avatar, customer_email, customer_phone,
//   last_message_body, last_message_sender, last_message_created_at,
//   unread_count
//
// buyer_conversations_with_details columns:
//   id, customer_id, store_id, topic, status,
//   last_message_at, created_at, updated_at,
//   store_name, store_logo, store_is_verified,
//   last_message_body, last_message_sender, last_message_created_at,
//   unread_count
// ─────────────────────────────────────────────────────────────

import { supabaseAdmin } from "../config/supabase.js";

const MESSAGE_FIELDS = `
  id, conversation_id, sender_id, sender_type,
  type, body, order_id, is_read, created_at
`.trim();

const CONVERSATION_BASE = `
  id, store_id, customer_id, topic, status,
  last_message_at, created_at, updated_at
`.trim();

const conversationService = {

  // ─────────────────────────────────────────────────────────
  // STORE — list conversations
  // ─────────────────────────────────────────────────────────
  // Queries store_conversations_with_details view.
  // Results include customer_name, customer_avatar, last_message_body,
  // and unread_count — all the fields ConvRow expects.

  async storeListConversations(storeId, { page, limit, status, search }) {
    let query = supabaseAdmin
      .from("store_conversations_with_details")
      .select("*", { count: "exact" })
      .eq("store_id", storeId);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Search on topic OR customer name
    if (search?.trim()) {
      query = query.or(
        `topic.ilike.%${search.trim()}%,customer_name.ilike.%${search.trim()}%`
      );
    }

    const from = (page - 1) * limit;
    query = query
      .order("last_message_at", { ascending: false })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { conversations: data ?? [], total: count ?? 0 };
  },

  // ─────────────────────────────────────────────────────────
  // STORE — single conversation + messages
  // ─────────────────────────────────────────────────────────
  // Uses the view for the conversation header fields, then fetches
  // messages separately so we can join order data on them.

  async storeGetConversation(storeId, conversationId) {
    // Get conversation from view (includes customer info)
    const { data: conversation, error } = await supabaseAdmin
      .from("store_conversations_with_details")
      .select("*")
      .eq("id", conversationId)
      .eq("store_id", storeId)
      .single();

    if (error || !conversation) return null;

    // Fetch messages with optional order context
    const { data: messages, error: msgErr } = await supabaseAdmin
      .from("messages")
      .select(`
        ${MESSAGE_FIELDS},
        order:order_id (
          id, status, subtotal,
          items:order_items (
            quantity, unit_price,
            product:product_id ( name, thumbnail_url )
          )
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgErr) throw msgErr;

    return { ...conversation, messages: messages ?? [] };
  },

  // ─────────────────────────────────────────────────────────
  // STORE — update status
  // ─────────────────────────────────────────────────────────

  async storeUpdateStatus(storeId, conversationId, status) {
    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return null;

    const { data, error } = await supabaseAdmin
      .from("conversations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .select(CONVERSATION_BASE)
      .single();

    if (error) throw error;

    // System message — this INSERT triggers the conversation UPDATE
    // trigger, which fires the Realtime event the frontend listens for
    await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      sender_id:       null,
      sender_type:     "system",
      type:            "system",
      body:            `Conversation marked as ${status}`,
    });

    return data;
  },

  // ─────────────────────────────────────────────────────────
  // STORE — send message
  // ─────────────────────────────────────────────────────────
  // Inserting a message triggers trg_update_conversation_last_message
  // which UPDATEs conversations.last_message_at.
  // That UPDATE fires the Realtime event (conversations table, store_id filter).

  async storeSendMessage(storeId, conversationId, { body, orderId, senderId }) {
    const { data: conversation } = await supabaseAdmin
      .from("conversations")
      .select("id, status")
      .eq("id", conversationId)
      .eq("store_id", storeId)
      .single();

    if (!conversation) return null;

    // Reopen if resolved/snoozed when store replies
    if (conversation.status !== "open") {
      await supabaseAdmin
        .from("conversations")
        .update({ status: "open", updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    const { data: message, error } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id:       senderId,
        sender_type:     "store",
        type:            "text",
        body:            body.trim(),
        order_id:        orderId ?? null,
      })
      .select(MESSAGE_FIELDS)
      .single();

    if (error) throw error;
    return message;
  },

  // ─────────────────────────────────────────────────────────
  // STORE — mark customer messages as read
  // ─────────────────────────────────────────────────────────

  async storeMarkAllRead(storeId, conversationId) {
    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return false;

    const { error } = await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("sender_type", "customer")
      .eq("is_read", false);

    if (error) throw error;
    return true;
  },

  // ─────────────────────────────────────────────────────────
  // STORE — quick replies
  // ─────────────────────────────────────────────────────────

  async storeListQuickReplies(storeId) {
    const { data, error } = await supabaseAdmin
      .from("quick_replies")
      .select("id, store_id, label, body, created_at, updated_at")
      .eq("store_id", storeId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async storeCreateQuickReply(storeId, { label, body }) {
    const { data, error } = await supabaseAdmin
      .from("quick_replies")
      .insert({ store_id: storeId, label: label.trim(), body: body.trim() })
      .select("id, store_id, label, body, created_at, updated_at")
      .single();
    if (error) throw error;
    return data;
  },

  async storeUpdateQuickReply(storeId, quickReplyId, payload) {
    const { data: existing } = await supabaseAdmin
      .from("quick_replies")
      .select("id")
      .eq("id", quickReplyId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return null;

    const update = {};
    if (payload.label) update.label = payload.label.trim();
    if (payload.body)  update.body  = payload.body.trim();
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("quick_replies")
      .update(update)
      .eq("id", quickReplyId)
      .select("id, store_id, label, body, created_at, updated_at")
      .single();
    if (error) throw error;
    return data;
  },

  async storeDeleteQuickReply(storeId, quickReplyId) {
    const { data: existing } = await supabaseAdmin
      .from("quick_replies")
      .select("id")
      .eq("id", quickReplyId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return false;

    const { error } = await supabaseAdmin
      .from("quick_replies")
      .delete()
      .eq("id", quickReplyId);
    if (error) throw error;
    return true;
  },

  // ─────────────────────────────────────────────────────────
  // BUYER — list conversations
  // ─────────────────────────────────────────────────────────

  async buyerListConversations(buyerId, { page, limit }) {
    const from = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from("buyer_conversations_with_details")
      .select("*", { count: "exact" })
      .eq("customer_id", buyerId)
      .order("last_message_at", { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;
    return { conversations: data ?? [], total: count ?? 0 };
  },

  // ─────────────────────────────────────────────────────────
  // BUYER — single conversation + messages
  // ─────────────────────────────────────────────────────────

  async buyerGetConversation(buyerId, conversationId) {
    const { data: conversation, error } = await supabaseAdmin
      .from("buyer_conversations_with_details")
      .select("*")
      .eq("id", conversationId)
      .eq("customer_id", buyerId)
      .single();

    if (error || !conversation) return null;

    const { data: messages, error: msgErr } = await supabaseAdmin
      .from("messages")
      .select(`
        ${MESSAGE_FIELDS},
        order:order_id (
          id, status, subtotal,
          items:order_items (
            quantity, unit_price,
            product:product_id ( name, thumbnail_url )
          )
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgErr) throw msgErr;

    return { ...conversation, messages: messages ?? [] };
  },

  // ─────────────────────────────────────────────────────────
  // BUYER — start or retrieve conversation
  // ─────────────────────────────────────────────────────────

  async buyerStartConversation(buyerId, { storeId, topic, body, orderId }) {
    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .single();

    if (!store) return null;

    // Upsert — one thread per buyer+store
    const { data: conversation, error: convErr } = await supabaseAdmin
      .from("conversations")
      .upsert(
        { store_id: storeId, customer_id: buyerId, topic: topic ?? null },
        { onConflict: "store_id,customer_id", ignoreDuplicates: false }
      )
      .select(CONVERSATION_BASE)
      .single();

    if (convErr) throw convErr;

    // Insert opening message if provided
    if (body?.trim()) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conversation.id,
        sender_id:       buyerId,
        sender_type:     "customer",
        type:            "text",
        body:            body.trim(),
        order_id:        orderId ?? null,
      });

      // Attach order_ref card if this message references an order
      if (orderId) {
        await supabaseAdmin.from("messages").insert({
          conversation_id: conversation.id,
          sender_id:       null,
          sender_type:     "system",
          type:            "order_ref",
          body:            "Order associated with this conversation",
          order_id:        orderId,
        });
      }
    }

    return conversation;
  },

  // ─────────────────────────────────────────────────────────
  // BUYER — send message
  // ─────────────────────────────────────────────────────────

  async buyerSendMessage(buyerId, conversationId, { body, orderId }) {
    const { data: conversation } = await supabaseAdmin
      .from("conversations")
      .select("id, status")
      .eq("id", conversationId)
      .eq("customer_id", buyerId)
      .single();

    if (!conversation) return null;

    // Reopen if snoozed/resolved when buyer messages again
    if (conversation.status !== "open") {
      await supabaseAdmin
        .from("conversations")
        .update({ status: "open", updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    const { data: message, error } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id:       buyerId,
        sender_type:     "customer",
        type:            "text",
        body:            body.trim(),
        order_id:        orderId ?? null,
      })
      .select(MESSAGE_FIELDS)
      .single();

    if (error) throw error;
    return message;
  },

  // ─────────────────────────────────────────────────────────
  // BUYER — mark store messages as read
  // ─────────────────────────────────────────────────────────

  async buyerMarkAllRead(buyerId, conversationId) {
    // Use the RPC defined in views.sql for security
    const { error } = await supabaseAdmin.rpc("mark_buyer_messages_read", {
      p_conversation_id: conversationId,
      p_buyer_id:        buyerId,
    });
    if (error) throw error;
    return true;
  },
};

export default conversationService;