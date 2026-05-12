// src/controllers/conversationController.js
// ─────────────────────────────────────────────────────────────
// HTTP handlers for the messages module.
// All store handlers confirm store ownership via req.store (set
// by requireStoreAccess middleware).
// All buyer handlers use req.user.id directly.
// ─────────────────────────────────────────────────────────────

import conversationService from "../services/conversationService.js";
import response            from "../utils/response.js";
import asyncHandler        from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────
// STORE handlers
// ─────────────────────────────────────────────────────────────

// GET /api/v1/stores/:storeId/conversations
export const storeListConversations = asyncHandler(async (req, res) => {
  const { conversations, total } = await conversationService.storeListConversations(
    req.store.id,
    req.query
  );
  return response.ok(
    res,
    conversations,
    response.pageMeta({ page: req.query.page, limit: req.query.limit, total })
  );
});

// GET /api/v1/stores/:storeId/conversations/:conversationId
export const storeGetConversation = asyncHandler(async (req, res) => {
  const conv = await conversationService.storeGetConversation(
    req.store.id,
    req.params.conversationId
  );
  if (!conv) return response.notFound(res, "Conversation not found");
  return response.ok(res, conv);
});

// PATCH /api/v1/stores/:storeId/conversations/:conversationId/status
export const storeUpdateStatus = asyncHandler(async (req, res) => {
  const conv = await conversationService.storeUpdateStatus(
    req.store.id,
    req.params.conversationId,
    req.body.status
  );
  if (!conv) return response.notFound(res, "Conversation not found");
  return response.ok(res, conv);
});

// POST /api/v1/stores/:storeId/conversations/:conversationId/messages
export const storeSendMessage = asyncHandler(async (req, res) => {
  const message = await conversationService.storeSendMessage(
    req.store.id,
    req.params.conversationId,
    {
      body:     req.body.body,
      orderId:  req.body.order_id ?? null,
      senderId: req.user.id,
    }
  );
  if (!message) return response.notFound(res, "Conversation not found");
  return response.created(res, message);
});

// PATCH /api/v1/stores/:storeId/conversations/:conversationId/read
// Marks all unread customer messages as read.
// Called when the store owner opens a conversation.
export const storeMarkAllRead = asyncHandler(async (req, res) => {
  const ok = await conversationService.storeMarkAllRead(
    req.store.id,
    req.params.conversationId
  );
  if (!ok) return response.notFound(res, "Conversation not found");
  return response.ok(res, { read: true });
});

// ── Quick replies ─────────────────────────────────────────────

// GET /api/v1/stores/:storeId/quick-replies
export const storeListQuickReplies = asyncHandler(async (req, res) => {
  const replies = await conversationService.storeListQuickReplies(req.store.id);
  return response.ok(res, replies);
});

// POST /api/v1/stores/:storeId/quick-replies
export const storeCreateQuickReply = asyncHandler(async (req, res) => {
  const reply = await conversationService.storeCreateQuickReply(
    req.store.id,
    req.body
  );
  return response.created(res, reply);
});

// PATCH /api/v1/stores/:storeId/quick-replies/:quickReplyId
export const storeUpdateQuickReply = asyncHandler(async (req, res) => {
  const reply = await conversationService.storeUpdateQuickReply(
    req.store.id,
    req.params.quickReplyId,
    req.body
  );
  if (!reply) return response.notFound(res, "Quick reply not found");
  return response.ok(res, reply);
});

// DELETE /api/v1/stores/:storeId/quick-replies/:quickReplyId
export const storeDeleteQuickReply = asyncHandler(async (req, res) => {
  const deleted = await conversationService.storeDeleteQuickReply(
    req.store.id,
    req.params.quickReplyId
  );
  if (!deleted) return response.notFound(res, "Quick reply not found");
  return response.noContent(res);
});

// ─────────────────────────────────────────────────────────────
// BUYER handlers
// ─────────────────────────────────────────────────────────────

// GET /api/v1/marketplace/conversations
export const buyerListConversations = asyncHandler(async (req, res) => {
  const { conversations, total } = await conversationService.buyerListConversations(
    req.user.id,
    req.query
  );
  return response.ok(
    res,
    conversations,
    response.pageMeta({ page: req.query.page, limit: req.query.limit, total })
  );
});

// POST /api/v1/marketplace/conversations
// Start a new conversation with a store (or return the existing one).
export const buyerStartConversation = asyncHandler(async (req, res) => {
  console.log(req.user.id , req.body)
  const conv = await conversationService.buyerStartConversation(
    req.user.id,
    req.body
  );
  if (!conv) return response.notFound(res, "Store not found");
  return response.created(res, conv);
});

// GET /api/v1/marketplace/conversations/:conversationId
export const buyerGetConversation = asyncHandler(async (req, res) => {
  const conv = await conversationService.buyerGetConversation(
    req.user.id,
    req.params.conversationId
  );
  if (!conv) return response.notFound(res, "Conversation not found");
  return response.ok(res, conv);
});

// POST /api/v1/marketplace/conversations/:conversationId/messages
export const buyerSendMessage = asyncHandler(async (req, res) => {
  const message = await conversationService.buyerSendMessage(
    req.user.id,
    req.params.conversationId,
    req.body
  );
  if (!message) return response.notFound(res, "Conversation not found");
  return response.created(res, message);
});
// PATCH /api/v1/marketplace/conversations/:conversationId/read
// Marks all unread customer messages as read.
// Called when the store owner opens a conversation.
export const buyerMarkAllRead = asyncHandler(async (req, res) => {
  const ok = await conversationService.buyerMarkAllRead(
    req.user.id,
    req.params.conversationId
  );
  if (!ok) return response.notFound(res, "Conversation not found");
  return response.ok(res, { read: true });
});