// src/middleware/validate.messages.js
// ─────────────────────────────────────────────────────────────
// Joi validation schemas for the messages module.
// Add these to your existing validate.js schemas object.
//
// Usage in your validate.js:
//
//   import { messageSchemas } from "./validate.messages.js";
//
//   export const schemas = {
//     ...existing schemas...
//     ...messageSchemas,
//   };
// ─────────────────────────────────────────────────────────────

import Joi from "joi";

const uuid = Joi.string().uuid({ version: "uuidv4" });

export const messageSchemas = {

  // GET /stores/:storeId/conversations
  // GET /marketplace/conversations
  conversationListQuery: Joi.object({
    page:   Joi.number().integer().min(1).default(1),
    limit:  Joi.number().integer().min(1).max(50).default(20),
    status: Joi.string().valid("open", "resolved", "snoozed", "all").default("all"),
    search: Joi.string().max(200).allow("", null),
  }),

  // POST /marketplace/conversations  — start a new conversation
  startConversation: Joi.object({
    store_id: uuid.required(),
    topic:    Joi.string().max(200).allow("", null),
    // Optional opening message
    body:     Joi.string().max(5000).allow("", null),
    order_id: uuid.allow(null),
  }),

  // POST /stores/:storeId/conversations/:id/messages
  // POST /marketplace/conversations/:id/messages
  sendMessage: Joi.object({
    body:     Joi.string().max(5000).trim().min(1).required(),
    order_id: uuid.allow(null),
    reference: Joi.object().allow("", null),
  }),

  // PATCH /stores/:storeId/conversations/:id/status
  updateStatus: Joi.object({
    status: Joi.string().valid("open", "resolved", "snoozed").required(),
  }),

  // POST /stores/:storeId/quick-replies
  createQuickReply: Joi.object({
    label: Joi.string().max(100).trim().min(1).required(),
    body:  Joi.string().max(2000).trim().min(1).required(),
  }),

  // PATCH /stores/:storeId/quick-replies/:qrId
  updateQuickReply: Joi.object({
    label: Joi.string().max(100).trim().min(1),
    body:  Joi.string().max(2000).trim().min(1),
  }).min(1), // at least one field required
};
