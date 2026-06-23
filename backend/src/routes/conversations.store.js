// src/routes/conversations.store.js
// Mount under: /api/v1/stores/:storeId  (with mergeParams: true)
// Full paths become: /api/v1/stores/:storeId/conversations/...

import express from "express";
import { authenticate } from "../middleware/auth.js";
import { requireStoreAccess } from "../middleware/storeAccess.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { messageSchemas } from "../middleware/validate.messages.js";
import { readLimiter, writeLimiter } from "../middleware/rateLimit.js";
import {
  storeListConversations,
  storeGetConversation,
  storeUpdateStatus,
  storeSendMessage,
  storeMarkAllRead,
  storeListQuickReplies,
  storeCreateQuickReply,
  storeUpdateQuickReply,
  storeDeleteQuickReply,
  storeStartConversation,
} from "../controllers/conversationController.js";

const router = express.Router({ mergeParams: true });

// All store routes require authentication and store ownership
router.use(authenticate, requireStoreAccess);

// ── Conversations ─────────────────────────────────────────────

// GET /api/v1/stores/:storeId/conversations
router.get(
  "/conversations",
  readLimiter,
  validateQuery(messageSchemas.conversationListQuery),
  storeListConversations
);

router.post(
  "/conversations",
  writeLimiter,
  validateBody(messageSchemas.storeStartConversation),
  storeStartConversation
);

// GET /api/v1/stores/:storeId/conversations/:conversationId
router.get("/conversations/:conversationId", readLimiter, storeGetConversation);

// PATCH /api/v1/stores/:storeId/conversations/:conversationId/status
router.patch(
  "/conversations/:conversationId/status",
  writeLimiter,
  validateBody(messageSchemas.updateStatus),
  storeUpdateStatus
);

// POST /api/v1/stores/:storeId/conversations/:conversationId/messages
router.post(
  "/conversations/:conversationId/messages",
  writeLimiter,
  validateBody(messageSchemas.sendMessage),
  storeSendMessage
);

// PATCH /api/v1/stores/:storeId/conversations/:conversationId/read
// Must be BEFORE /:conversationId to avoid "read" matching as an id
router.patch(
  "/conversations/:conversationId/read",
  writeLimiter,
  storeMarkAllRead
);

// ── Quick replies ─────────────────────────────────────────────

// GET /api/v1/stores/:storeId/quick-replies
router.get("/quick-replies", readLimiter, storeListQuickReplies);

// POST /api/v1/stores/:storeId/quick-replies
router.post(
  "/quick-replies",
  writeLimiter,
  validateBody(messageSchemas.createQuickReply),
  storeCreateQuickReply
);

// PATCH /api/v1/stores/:storeId/quick-replies/:quickReplyId
router.patch(
  "/quick-replies/:quickReplyId",
  writeLimiter,
  validateBody(messageSchemas.updateQuickReply),
  storeUpdateQuickReply
);

// DELETE /api/v1/stores/:storeId/quick-replies/:quickReplyId
router.delete(
  "/quick-replies/:quickReplyId",
  writeLimiter,
  storeDeleteQuickReply
);

export default router;
