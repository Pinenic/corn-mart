// src/routes/conversations.buyer.js
// Mount under: /api/v1/marketplace  (already in your routes/index.js)
// Full paths: /api/v1/marketplace/conversations/...

import express from "express";
import { authenticate } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { messageSchemas } from "../middleware/validate.messages.js";
import { readLimiter, writeLimiter } from "../middleware/rateLimit.js";
import {
  buyerListConversations,
  buyerStartConversation,
  buyerGetConversation,
  buyerSendMessage,
  buyerMarkAllRead,
} from "../controllers/conversationController.js";

const router = express.Router();

// All buyer conversation routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /marketplace/conversations:
 *   get:
 *     summary: List buyer's conversations
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of conversations per page
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  readLimiter,
  validateQuery(messageSchemas.conversationListQuery),
  buyerListConversations
);

/**
 * @swagger
 * /marketplace/conversations:
 *   post:
 *     summary: Start a new conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeId
 *               - message
 *             properties:
 *               storeId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation started
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  writeLimiter,
  validateBody(messageSchemas.startConversation),
  buyerStartConversation
);

/**
 * @swagger
 * /marketplace/conversations/{conversationId}:
 *   get:
 *     summary: Get conversation details
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation details
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:conversationId", readLimiter, buyerGetConversation);

/**
 * @swagger
 * /marketplace/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message in conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/:conversationId/messages",
  writeLimiter,
  validateBody(messageSchemas.sendMessage),
  buyerSendMessage
);
// PATCH /api/v1/marketplace/conversations/:conversationId/read
// Must be BEFORE /:conversationId to avoid "read" matching as an id
router.patch(
  "/:conversationId/read",
  writeLimiter,
  buyerMarkAllRead
);
export default router;
