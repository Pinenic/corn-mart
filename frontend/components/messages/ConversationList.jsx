"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import {
  CONVERSATIONS, CONV_STATUS,
  getCustomer, formatMessageTime, MESSAGES,
} from "@/lib/messages-data";

const FILTERS = ["All", "Open", "Resolved", "Unread"];

function ConvRow({ conv, isSelected, onClick }) {
  const customer = getCustomer(conv.customer_id);
  const msgs     = MESSAGES[conv.id] || [];
  // Last non-system message for preview
  const lastMsg  = [...msgs].reverse().find((m) => m.sender !== "system");
  const preview  = lastMsg?.body ?? "No messages yet";
  const isStore  = lastMsg?.sender === "store";

  if (!customer) return null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 relative"
      style={{
        background: isSelected
          ? "var(--color-accent-subtle)"
          : conv.unread > 0 ? "var(--color-bg)" : "transparent",
        borderLeft: conv.unread > 0 && !isSelected
          ? "2.5px solid var(--color-accent)"
          : "2.5px solid transparent",
      }}
    >
      {/* Avatar with online dot */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold"
          style={{ background: customer.avatarBg, color: customer.avatarColor }}
        >
          {customer.initials}
        </div>
        {/* Status dot — using conv status colour */}
        {conv.status === "open" && (
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ background: "var(--color-success)" }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className="text-[13px] font-semibold truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {customer.name}
          </span>
          <span className="text-[10px] flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
            {formatMessageTime(conv.last_message_at)}
          </span>
        </div>

        {/* Topic pill */}
        {conv.topic && (
          <p className="text-[10px] font-medium mb-1 truncate" style={{ color: "var(--color-text-tertiary)" }}>
            {conv.topic}
          </p>
        )}

        <div className="flex items-center gap-2">
          <p
            className="text-[12px] truncate flex-1 leading-snug"
            style={{
              color:      conv.unread > 0 ? "var(--color-text-secondary)" : "var(--color-text-tertiary)",
              fontWeight: conv.unread > 0 ? 500 : 400,
            }}
          >
            {isStore && <span style={{ color: "var(--color-text-tertiary)" }}>You: </span>}
            {preview}
          </p>
          {conv.unread > 0 && (
            <span
              className="flex-shrink-0 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ background: "var(--color-accent)" }}
            >
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function ConversationList({ selectedId, onSelect }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    let list = [...CONVERSATIONS].sort(
      (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
    );

    if (filter === "Open")     list = list.filter((c) => c.status === "open");
    if (filter === "Resolved") list = list.filter((c) => c.status === "resolved");
    if (filter === "Unread")   list = list.filter((c) => c.unread > 0);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const cust = getCustomer(c.customer_id);
        return (
          cust?.name.toLowerCase().includes(q) ||
          cust?.email.toLowerCase().includes(q) ||
          c.topic?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [search, filter]);

  const totalUnread = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b flex-shrink-0" style={{ borderColor: "var(--color-border)" }}>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-tertiary)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers, topics…"
            className="w-full h-8 pl-8 pr-3 rounded-lg border text-[12px] outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "var(--color-bg)" }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b flex-shrink-0" style={{ borderColor: "var(--color-border)" }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          const count  =
            f === "All"      ? CONVERSATIONS.length :
            f === "Unread"   ? totalUnread :
            f === "Open"     ? CONVERSATIONS.filter((c) => c.status === "open").length :
            CONVERSATIONS.filter((c) => c.status === "resolved").length;

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex-1 justify-center"
              style={{
                background:  active ? "var(--color-accent-subtle)" : "transparent",
                color:       active ? "var(--color-accent-text)"   : "var(--color-text-secondary)",
              }}
            >
              {f}
              {count > 0 && (
                <span
                  className="text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center"
                  style={{
                    background: active ? "var(--color-accent)" : "var(--color-bg)",
                    color:      active ? "#fff"                : "var(--color-text-tertiary)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--color-border)" }}>
        {filtered.length === 0 ? (
          <div className="py-10 text-center px-4">
            <p className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
              No conversations found
            </p>
          </div>
        ) : filtered.map((conv) => (
          <ConvRow
            key={conv.id}
            conv={conv}
            isSelected={selectedId === conv.id}
            onClick={() => onSelect(conv.id)}
          />
        ))}
      </div>
    </div>
  );
}
