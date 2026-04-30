// ─────────────────────────────────────────────────────────────
//  Messages data
//
//  Model: conversations belong to customers, not orders.
//  Orders are referenced on individual messages via order_id.
//  This mirrors the recommended schema remodel.
// ─────────────────────────────────────────────────────────────

import { ORDERS } from "./orders-data";

// ── Customers (derived from orders + extras) ──────────────────
export const CUSTOMERS = [
  { id: "cust-001", name: "Ama Kusi",       email: "ama.kusi@email.com",      phone: "+1 (555) 100-2001", initials: "AK", avatarBg: "#fef3c7", avatarColor: "#92400e",  orderIds: []        },
  { id: "cust-002", name: "James Mensah",   email: "james.mensah@email.com",  phone: "+1 (555) 234-5678", initials: "JM", avatarBg: "#f0fdf4", avatarColor: "#166534",  orderIds: ["4290"]  },
  { id: "cust-003", name: "Amara Diallo",   email: "amara.diallo@email.com",  phone: "+1 (555) 345-6789", initials: "AD", avatarBg: "#ede9fe", avatarColor: "#5b21b6",  orderIds: ["4289"]  },
  { id: "cust-004", name: "Lena Torres",    email: "lena.torres@email.com",   phone: "+1 (555) 456-7890", initials: "LT", avatarBg: "#fef2f2", avatarColor: "#991b1b",  orderIds: ["4288"]  },
  { id: "cust-005", name: "Reuben Tetteh",  email: "reuben.tetteh@email.com", phone: "+1 (555) 500-6001", initials: "RT", avatarBg: "#fff7ed", avatarColor: "#9a3412",  orderIds: []        },
  { id: "cust-006", name: "Sofia Bianchi",  email: "sofia.bianchi@email.com", phone: "+1 (555) 600-7001", initials: "SB", avatarBg: "#f0f9ff", avatarColor: "#075985",  orderIds: []        },
  { id: "cust-007", name: "Marcus Reid",    email: "marcus.reid@email.com",   phone: "+1 (555) 789-0123", initials: "MR", avatarBg: "#fff7ed", avatarColor: "#9a3412",  orderIds: ["4285"]  },
  { id: "cust-008", name: "Aisha Conteh",   email: "aisha.conteh@email.com",  phone: "+1 (555) 890-1234", initials: "AC", avatarBg: "#ecfdf5", avatarColor: "#065f46",  orderIds: ["4284"]  },
  { id: "cust-009", name: "Sarah Kim",      email: "sarah.kim@email.com",     phone: "+1 (555) 012-3456", initials: "SK", avatarBg: "#fef3c7", avatarColor: "#92400e",  orderIds: ["4291"]  },
  { id: "cust-010", name: "Kwame Asante",   email: "kwame.asante@email.com",  phone: "+1 (555) 567-8901", initials: "KA", avatarBg: "#f0f9ff", avatarColor: "#075985",  orderIds: ["4287"]  },
];

// ── Conversation statuses ─────────────────────────────────────
export const CONV_STATUS = {
  open:     { label: "Open",     color: "var(--color-accent)"   },
  resolved: { label: "Resolved", color: "var(--color-success)"  },
  snoozed:  { label: "Snoozed",  color: "var(--color-warning)"  },
};

// ── Conversations (1 per customer) ───────────────────────────
// last_message_at drives sort order in the list
export const CONVERSATIONS = [
  {
    id: "conv-001",
    customer_id:      "cust-001",
    status:           "open",
    unread:           2,
    last_message_at:  "2026-03-18T10:52:00Z",
    topic:            "Late delivery enquiry",
  },
  {
    id: "conv-002",
    customer_id:      "cust-002",
    status:           "open",
    unread:           1,
    last_message_at:  "2026-03-18T10:36:00Z",
    topic:            "Size change request",
  },
  {
    id: "conv-003",
    customer_id:      "cust-003",
    status:           "open",
    unread:           0,
    last_message_at:  "2026-03-17T22:14:00Z",
    topic:            "Processing enquiry",
  },
  {
    id: "conv-004",
    customer_id:      "cust-004",
    status:           "resolved",
    unread:           0,
    last_message_at:  "2026-03-16T15:20:00Z",
    topic:            "Cancellation & refund",
  },
  {
    id: "conv-005",
    customer_id:      "cust-005",
    status:           "open",
    unread:           0,
    last_message_at:  "2026-03-18T07:10:00Z",
    topic:            "Product availability",
  },
  {
    id: "conv-006",
    customer_id:      "cust-006",
    status:           "open",
    unread:           0,
    last_message_at:  "2026-03-17T14:05:00Z",
    topic:            "Return policy",
  },
  {
    id: "conv-007",
    customer_id:      "cust-007",
    status:           "resolved",
    unread:           0,
    last_message_at:  "2026-03-16T11:30:00Z",
    topic:            "Product feedback",
  },
  {
    id: "conv-008",
    customer_id:      "cust-008",
    status:           "open",
    unread:           4,
    last_message_at:  "2026-03-17T21:45:00Z",
    topic:            "Pre-purchase enquiry",
  },
  {
    id: "conv-009",
    customer_id:      "cust-009",
    status:           "resolved",
    unread:           0,
    last_message_at:  "2026-03-15T13:20:00Z",
    topic:            "Delivery confirmation",
  },
];

// ── Messages ─────────────────────────────────────────────────
// sender: "customer" | "store"
// order_id: nullable — renders an inline order context card when present
// type: "text" | "order_ref" | "system"
//   "order_ref" = a system-generated card when an order is first associated
//   "system"    = e.g. "Conversation marked as resolved"
export const MESSAGES = {
  "conv-001": [
    { id: "m1a", sender: "customer", body: "Hi, I placed an order 5 days ago and it still hasn't arrived. Can you check on it?", created_at: "2026-03-18T08:30:00Z", order_id: null },
    { id: "m1b", sender: "store",    body: "Hi Ama! So sorry to hear that. Let me look into this right away.", created_at: "2026-03-18T09:10:00Z", order_id: null },
    { id: "m1c", sender: "customer", body: "My order number should be around the ones from last week, I've ordered before.", created_at: "2026-03-18T10:40:00Z", order_id: null },
    { id: "m1d", sender: "customer", body: "Actually it might be related to the Canvas Tote I ordered. Any update?", created_at: "2026-03-18T10:52:00Z", order_id: null },
  ],

  "conv-002": [
    { id: "m2a", type: "order_ref", sender: "system", body: "Order #4290 associated with this conversation.", created_at: "2026-03-14T10:00:00Z", order_id: "4290" },
    { id: "m2b", sender: "customer", body: "Hi! I just placed an order for Studio Buds X in Midnight Black but I'd like to change it to Pearl White instead. Is that possible?", created_at: "2026-03-14T10:15:00Z", order_id: "4290" },
    { id: "m2c", sender: "store",    body: "Hey James! I can see your order is still in processing. Let me check if we can make that swap for you.", created_at: "2026-03-14T11:00:00Z", order_id: "4290" },
    { id: "m2d", sender: "store",    body: "Good news — the order hasn't been packed yet. I've updated the variant to Pearl White. You'll get a confirmation shortly.", created_at: "2026-03-14T11:20:00Z", order_id: "4290" },
    { id: "m2e", sender: "customer", body: "Amazing, thank you so much! You're super helpful 🙏", created_at: "2026-03-14T11:35:00Z", order_id: null },
    { id: "m2f", sender: "customer", body: "Hey, quick follow-up — any update on the delivery timeline?", created_at: "2026-03-18T10:36:00Z", order_id: "4290" },
  ],

  "conv-003": [
    { id: "m3a", type: "order_ref", sender: "system", body: "Order #4289 associated with this conversation.", created_at: "2026-03-14T20:00:00Z", order_id: "4289" },
    { id: "m3b", sender: "customer", body: "Hello, I ordered a Slate Watch, two Linen Shirts and a Bamboo Lamp yesterday. Just wanted to check the status.", created_at: "2026-03-14T20:05:00Z", order_id: "4289" },
    { id: "m3c", sender: "store",    body: "Hi Amara! Your order is currently being packed. We aim to ship within 24 hours — you'll receive a tracking email once it's on its way.", created_at: "2026-03-14T21:00:00Z", order_id: "4289" },
    { id: "m3d", sender: "customer", body: "Perfect, thank you! Will it arrive before the weekend?", created_at: "2026-03-17T22:14:00Z", order_id: "4289" },
  ],

  "conv-004": [
    { id: "m4a", type: "order_ref", sender: "system", body: "Order #4288 associated with this conversation.", created_at: "2026-03-13T12:00:00Z", order_id: "4288" },
    { id: "m4b", sender: "customer", body: "Hi, I need to cancel my order. I ordered the wrong shoe size.", created_at: "2026-03-13T12:05:00Z", order_id: "4288" },
    { id: "m4c", sender: "store",    body: "Hi Lena, no problem at all. I've cancelled your order #4288. Your refund will be processed within 3–5 business days.", created_at: "2026-03-13T12:30:00Z", order_id: "4288" },
    { id: "m4d", sender: "customer", body: "Thank you! And sorry for the trouble.", created_at: "2026-03-13T12:45:00Z", order_id: null },
    { id: "m4e", sender: "store",    body: "Not at all! When you're ready to reorder, just let us know and we'll make sure to get the right size.", created_at: "2026-03-13T13:00:00Z", order_id: null },
    { id: "m4f", type: "system", sender: "system", body: "Conversation marked as resolved.", created_at: "2026-03-16T15:20:00Z", order_id: null },
  ],

  "conv-005": [
    { id: "m5a", sender: "customer", body: "Do you have the Slate Watch in black with a leather strap? The website shows it as available but I want to confirm before ordering.", created_at: "2026-03-18T07:10:00Z", order_id: null },
  ],

  "conv-006": [
    { id: "m6a", sender: "customer", body: "Hi! What is your return policy? I received a shirt and the colour is slightly different from the photo online.", created_at: "2026-03-17T14:05:00Z", order_id: null },
  ],

  "conv-007": [
    { id: "m7a", type: "order_ref", sender: "system", body: "Order #4285 associated with this conversation.", created_at: "2026-03-11T14:00:00Z", order_id: "4285" },
    { id: "m7b", sender: "customer", body: "Just received my Canvas Tote order. The olive colour is stunning — exactly what I expected. Will definitely order again!", created_at: "2026-03-14T16:30:00Z", order_id: "4285" },
    { id: "m7c", sender: "store",    body: "That's so great to hear Marcus! The olive is one of our favourites too 🙌 Thank you for shopping with us!", created_at: "2026-03-15T09:00:00Z", order_id: null },
    { id: "m7d", type: "system", sender: "system", body: "Conversation marked as resolved.", created_at: "2026-03-16T11:30:00Z", order_id: null },
  ],

  "conv-008": [
    { id: "m8a", sender: "customer", body: "Hi! Is the Air Runner Pro available in size 42?", created_at: "2026-03-17T18:00:00Z", order_id: null },
    { id: "m8b", sender: "customer", body: "Also interested in the Navy colourway specifically.", created_at: "2026-03-17T18:02:00Z", order_id: null },
    { id: "m8c", sender: "customer", body: "And do you ship internationally? I'm based in Accra.", created_at: "2026-03-17T20:10:00Z", order_id: null },
    { id: "m8d", sender: "customer", body: "Sorry for all the questions 😅 — just want to make sure before I place the order.", created_at: "2026-03-17T21:45:00Z", order_id: null },
  ],

  "conv-009": [
    { id: "m9a", type: "order_ref", sender: "system", body: "Order #4291 associated with this conversation.", created_at: "2026-03-15T10:10:00Z", order_id: "4291" },
    { id: "m9b", sender: "customer", body: "Hi! Just checking — my order was placed yesterday. Any idea on delivery time?", created_at: "2026-03-15T10:10:00Z", order_id: "4291" },
    { id: "m9c", sender: "store",    body: "Hi Sarah! Your order shipped this morning and is expected by Mar 18. You'll receive tracking info via email shortly.", created_at: "2026-03-15T11:00:00Z", order_id: "4291" },
    { id: "m9d", sender: "customer", body: "Perfect! Just got my package — everything looks great, thank you!", created_at: "2026-03-18T13:20:00Z", order_id: "4291" },
    { id: "m9e", type: "system", sender: "system", body: "Conversation marked as resolved.", created_at: "2026-03-15T13:20:00Z", order_id: null },
  ],
};

// ── Quick replies (saved templates) ──────────────────────────
export const QUICK_REPLIES = [
  { id: "qr1", label: "Order shipped",    body: "Great news! Your order has been shipped and is on its way. You'll receive a tracking email shortly." },
  { id: "qr2", label: "Processing delay", body: "We're sorry for the delay — your order is still being processed. We'll update you as soon as it ships." },
  { id: "qr3", label: "Return policy",    body: "We accept returns within 14 days of delivery. Items must be unused and in original packaging. Reply here to start the process." },
  { id: "qr4", label: "Stock confirm",    body: "Yes, that item is currently in stock! You can place your order on the website and it will ship within 1–2 business days." },
  { id: "qr5", label: "Thank you",        body: "Thank you so much for your kind words! It means a lot to us. We hope to see you again soon 🙏" },
];

// ── Helpers ───────────────────────────────────────────────────
export function getCustomer(id) {
  return CUSTOMERS.find((c) => c.id === id);
}

export function getConversationWithCustomer(conv) {
  return { ...conv, customer: getCustomer(conv.customer_id) };
}

export function getCustomerOrders(customerId) {
  const customer = getCustomer(customerId);
  if (!customer) return [];
  return ORDERS.filter((o) => customer.orderIds.includes(o.id));
}

export function formatMessageTime(isoString) {
  const d = new Date(isoString);
  const now = new Date("2026-03-18T12:00:00Z");
  const diffMs  = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr  < 24) return `${diffHr}h ago`;
  if (diffDay < 7)  return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatMessageTimeFull(isoString) {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}
