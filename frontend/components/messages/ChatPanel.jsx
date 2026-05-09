"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, MoreHorizontal, CheckCircle, Clock,
  Zap, Send, ChevronDown, X, ShoppingBag, Mail, Phone,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { OrderContextCard } from "./OrderContextCard";
import { formatMessageTimeFull } from "@/lib/messages-data";
import { useBuyerConversation, useBuyerConversations } from "@/lib/hooks/useBuyerMessages";
import { useProfile } from "@/lib/store/useProfile";

function SystemMessage({ msg }) {
  if (msg.type === "order_ref") {
    return (
      <div className="flex flex-col items-center gap-2 my-3">
        <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          {formatMessageTimeFull(msg.created_at)}
        </p>
        <OrderContextCard orderId={msg.order_id} />
      </div>
    );
  }
  // Generic system message
  return (
    <div className="flex justify-center my-3">
      <span
        className="text-[11px] px-3 py-1 rounded-full"
        style={{ background: "var(--color-bg)", color: "var(--color-text-tertiary)", border: "0.5px solid var(--color-border)" }}
      >
        {msg.body}
      </span>
    </div>
  );
}

function MessageBubble({ msg, store, showTime, userSide = "buyer" }) {
  // Perspective: from buyer's view vs store's view
  const isCurrentUser = userSide === "buyer" 
    ? msg.sender_type === "customer" 
    : msg.sender_type === "store";
  const isOtherUser = !isCurrentUser;

  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      {/* Other user avatar */}
      {isOtherUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 self-end mb-0.5"
          style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent-text)" }}
        >
          {store ? <img src={userSide === "buyer" ? store?.customer_avatar : store?.store_logo} alt="store" className="w-full h-full rounded-full" /> : "SK"}
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[75%] ${isCurrentUser ? "items-end" : "items-start"}`}>
        {/* Order reference pill (compact) for regular messages with order_id */}
        {msg.order_id && msg.type !== "order_ref" && (
          <OrderContextCard orderId={msg.order_id} compact />
        )}

        {/* Bubble */}
        <div
          className="px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
          style={
            isCurrentUser
              ? { background: "var(--color-accent)", color: "white", borderBottomRightRadius: 4 }
              : { background: "white", color: "var(--color-text-primary)", border: "0.5px solid var(--color-border)", borderBottomLeftRadius: 4 }
          }
        >
          {msg.body}
        </div>

        {/* Timestamp */}
        {showTime && (
          <p className="text-[10px] px-1" style={{ color: "var(--color-text-tertiary)" }}>
            {formatMessageTimeFull(msg.created_at)}
            {isCurrentUser && " · You"}
          </p>
        )}
      </div>

      {/* Current user avatar */}
      {isCurrentUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 self-end mb-0.5"
          style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
        >
          {/* Use buyer initials or something */}
          Y
        </div>
      )}
    </div>
  );
}

export function ChatPanel({ 
  convId, 
  conversation, 
  messages, 
  isLoading, 
  sending, 
  sendMessage, 
  markAllRead,
  onBack, 
  userSide = "buyer" 
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Re-load when convId changes
  useEffect(() => {
    setText("");
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // markAllRead();
  }, [messages]);

  // Find conv + customer
  // const conversation = CONVERSATIONS.find((c) => c.id === convId);
  // const customer     = conversation ? getCustomer(conversation.customer_id) : null;
  // const customerOrders = conversation ? getCustomerOrders(conversation.customer_id) : [];

  if (!conversation) return <div>Loading...</div>;

  const handleSendMessage = () => {
    if (!text.trim()) return;
    sendMessage({ body: text });
    setText("");
    // mutate(); // Hook handles revalidation
  };

  // const markResolved = () => {
  //   setMessages((prev) => [
  //     ...prev,
  //     { id: `sys-${Date.now()}`, type: "system", sender: "system", body: "Conversation marked as resolved.", created_at: new Date().toISOString(), order_id: null },
  //   ]);
  //   onStatusChange?.(convId, "resolved");
  // };

  // Assume status config, or hardcode for now
  const statusCfg = { label: conversation.status === "open" ? "Open" : "Resolved" };

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}>
          {/* Mobile back */}
          <button onClick={onBack} className="md:hidden flex items-center gap-1 text-[13px] font-medium flex-shrink-0"
            style={{ color: "var(--color-accent)" }}>
            <ArrowLeft size={14} />
          </button>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold"
              >
              <img src={userSide == "buyer" ? conversation?.store_logo : conversation?.customer_avatar} alt="s_logo" className="w-full h-full" />
            </div>
            {conversation.status === "open" && (
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-[1.5px] border-white"
                style={{ background: "var(--color-success)" }} />
            )}
          </div>

          {/* Name + topic */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
              {userSide == "buyer" ? conversation?.store_name : conversation?.customer_name}
            </p>
            <p className="text-[11px] truncate" style={{ color: "var(--color-text-tertiary)" }}>
              {conversation.topic}
            </p>
          </div>

          {/* Status badge */}
          <Badge
            variant={conversation.status === "open" ? "info" : conversation.status === "resolved" ? "success" : "warning"}
          >
            {statusCfg.label}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {conversation.status === "open" && (
              <button 
                className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-[11px] font-medium transition-colors hover:bg-[var(--color-success-bg)]"
                style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}
                title="Mark as resolved">
                <CheckCircle size={13} />
                <span className="hidden sm:inline">Resolve</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-scroll px-4 py-4 space-y-3"
          style={{ background: "var(--color-bg)" }}>
          {messages.map((msg, i) => {
            if (msg.type === "system") return <SystemMessage key={msg.id} msg={msg} />;
            // Show timestamp if last message or sender changes
            const next = messages[i + 1];
            const showTime = !next || next.sender_type !== msg.sender_type || next.type === "system";
            return (
              <MessageBubble key={msg.id} msg={msg} store={conversation} showTime={showTime} userSide={userSide} />
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies bar - commented out as hooks don't provide quick replies */}
        {/* {showQuickReplies && (
          <div className="px-3 py-2 border-t flex gap-2 overflow-x-auto flex-shrink-0"
            style={{ borderColor: "var(--color-border)", background: "white", scrollbarWidth: "none" }}>
            {QUICK_REPLIES.map((qr) => (
              <button key={qr.id}
                onClick={() => { setText(qr.body); setShowQR(false); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors hover:bg-[var(--color-accent-subtle)]"
                style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                {qr.label}
              </button>
            ))}
            <button onClick={() => setShowQR(false)}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg)]"
              style={{ color: "var(--color-text-tertiary)" }}>
              <X size={13} />
            </button>
          </div>
        )} */}

        {/* Compose */}
        <div className="flex items-end gap-2 p-3 border-t flex-shrink-0"
          style={{ borderColor: "var(--color-border)", background: "white" }}>
          {/* Text input */}
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder={conversation.status === "resolved" ? "This conversation is resolved. Type to reopen…" : "Type a reply… (Enter to send, Shift+Enter for new line)"}
            rows={1}
            className="flex-1 px-3 py-2 rounded-lg border text-[13px] outline-none transition-colors resize-none overflow-hidden focus:border-[var(--color-accent)]"
            style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", minHeight: 36, maxHeight: 120, lineHeight: "1.5" }}
          />

          {/* Send */}
          <button
            onClick={handleSendMessage}
            disabled={!text.trim() || sending}
            className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: text.trim() && !sending ? "var(--color-accent)" : "var(--color-bg)", color: text.trim() && !sending ? "white" : "var(--color-text-tertiary)" }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* ── Customer sidebar - commented out for buyer view ── */}
      {/*
      {showSidebar && (
        <div className="w-64 flex-shrink-0 border-l flex flex-col overflow-hidden"
          style={{ borderColor: "var(--color-border)", background: "white" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
            style={{ borderColor: "var(--color-border)" }}>
            <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Customer info
            </p>
            <button onClick={() => setShowSidebar(false)}
              className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--color-bg)]"
              style={{ color: "var(--color-text-tertiary)" }}>
              <X size={13} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold"
                  style={{ background: customer.avatarBg, color: customer.avatarColor }}>
                  {customer.initials}
                </div>
                <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {customer.name}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail size={12} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
                  <p className="text-[11px] truncate" style={{ color: "var(--color-text-secondary)" }}>{customer.email}</p>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
                    <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{customer.phone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                  Order history
                </p>
                <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {customerOrders.length} order{customerOrders.length !== 1 ? "s" : ""}
                </span>
              </div>

              {customerOrders.length === 0 ? (
                <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                  No orders yet
                </p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status];
                    return (
                      <Link key={order.id} href={`/orders/${order.id}`}>
                        <div className="flex items-center gap-2 p-2 rounded-lg border transition-colors hover:bg-[var(--color-bg)] cursor-pointer"
                          style={{ borderColor: "var(--color-border)" }}>
                          <ShoppingBag size={12} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold" style={{ color: "var(--color-accent-text)" }}>
                              #{order.id}
                            </p>
                            <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                              {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={cfg.variant} className="text-[9px]">{order.status}</Badge>
                            <p className="text-[10px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
}
