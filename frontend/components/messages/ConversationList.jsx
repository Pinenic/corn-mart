"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { formatMessageTime } from "@/lib/messages-data";
import { useBuyerConversations } from "@/lib/hooks/useBuyerMessages";

const FILTERS = ["All", "Open", "Resolved", "Unread"];

function ConvRow({ conv, isSelected, userSide, onClick }) {
  const lastMsg = conv?.last_message_body;
  const preview = conv?.last_message_body ?? "No messages yet";
  const isBuyer = conv?.last_message_sender === "customer";

  if (!conv) return null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 relative"
      style={{
        background: isSelected
          ? "var(--color-accent-subtle)"
          : conv?.unread_count > 0
          ? "var(--color-bg)"
          : "transparent",
        borderLeft:
          conv?.unread_count > 0 && !isSelected
            ? "2.5px solid var(--color-accent)"
            : "2.5px solid transparent",
      }}
    >
      {/* Avatar with online dot */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div className="w-9 h-9 rounded-full overflow-hidden">
          <img
            src={userSide == "buyer" ? conv?.store_logo : conv?.customer_avatar}
            alt="store logo"
            className="w-full h-full object-cover"
          />
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
            {userSide == "buyer" ? conv?.store_name : conv?.customer_name}
          </span>
          <span
            className="text-[10px] flex-shrink-0"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {formatMessageTime(conv?.last_message_at)}
          </span>
        </div>

        {/* Topic pill */}
        {conv.topic && (
          <p
            className="text-[10px] font-medium mb-1 truncate"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {conv?.topic || ""}
          </p>
        )}

        <div className="flex items-center gap-2">
          <p
            className="text-[12px] truncate flex-1 leading-snug"
            style={{
              color:
                conv.unread_count > 0
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-tertiary)",
              fontWeight: conv.unread_count > 0 ? 500 : 400,
            }}
          >
            { userSide ==="buyer" ? (
              <span style={{ color: "var(--color-text-tertiary)" }}>{isBuyer ? "You: " : ""}</span>
            ) : <span style={{ color: "var(--color-text-tertiary)" }}>{isBuyer ? "" : "You: "}</span>}
            {preview}
          </p>
          {conv.unread_count > 0 && (
            <span
              className="flex-shrink-0 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ background: "var(--color-accent)" }}
            >
              {conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function ConversationList({ conversations, isLoading, userSide, selectedId, onSelect }) {
  const { convId } = useParams();
  const router = useRouter();
  const activeId = selectedId ?? convId;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // const { conversations, total, isLoading, mutate } = useBuyerConversations();
  // console.log(conversations);

  const filtered = useMemo(() => {
    let list = [...conversations].sort(
      (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
    );

    // console.log("list: ", list)

    if (filter === "Open") list = list.filter((c) => c.status === "open");
    if (filter === "Resolved")
      list = list.filter((c) => c.status === "resolved");
    if (filter === "Unread") list = list.filter((c) => c.unread_count > 0);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        return (
          c.store_name?.toLowerCase().includes(q) ||
          c.topic?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [search, filter, conversations]);
  // console.log("filtered: ", filtered);

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div
        className="p-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-tertiary)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers, topics…"
            className="w-full h-8 pl-8 pr-3 rounded-lg border text-[12px] outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border-md)",
              color: "var(--color-text-primary)",
              background: "var(--color-bg)",
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 px-3 py-2 border-b flex-shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          const count =
            f === "All"
              ? conversations.length
              : f === "Unread"
              ? totalUnread
              : f === "Open"
              ? conversations.filter((c) => c.status === "open").length
              : conversations.filter((c) => c.status === "resolved").length;

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex-1 justify-center"
              style={{
                background: active
                  ? "var(--color-accent-subtle)"
                  : "transparent",
                color: active
                  ? "var(--color-accent-text)"
                  : "var(--color-text-secondary)",
              }}
            >
              {f}
              {count > 0 && (
                <span
                  className="text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center"
                  style={{
                    background: active
                      ? "var(--color-accent)"
                      : "var(--color-bg)",
                    color: active ? "#fff" : "var(--color-text-tertiary)",
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
      <div
        className="flex-1 overflow-y-auto divide-y"
        style={{ borderColor: "var(--color-border)" }}
      >
        {filtered.length === 0 ? (
          <div className="py-10 text-center px-4">
            <p
              className="text-[13px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              No conversations found
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConvRow
              key={conv.id}
              conv={conv}
              isSelected={activeId === conv.id}
              userSide = {userSide}
              onClick={() => {
                if (onSelect) {
                  onSelect(conv.id);
                } else {
                  if(userSide == "store"){
                    router.push(`/dashboard/messages/${conv.id}`)
                    return
                  }
                  router.push(`/account/messages/${conv.id}`);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
