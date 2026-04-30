"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatPanel } from "@/components/messages/ChatPanel";
import { CONVERSATIONS } from "@/lib/messages-data";

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [convStatuses, setStatuses] = useState(
    Object.fromEntries(CONVERSATIONS.map((c) => [c.id, c.status]))
  );

  const handleStatusChange = (convId, newStatus) => {
    setStatuses((prev) => ({ ...prev, [convId]: newStatus }));
  };

  const totalUnread = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  return (
    /*
     * This page uses a fixed-height container that fills the remaining
     * viewport (after the header and bottom nav). We break out of the
     * DashboardShell's normal padded/scrollable <main> using -mx and -my
     * to extend edge-to-edge within the content area.
     *
     * The outer div uses h-[calc(100vh-var(--header-height)-var(--bottom-nav-height,0px))]
     * to fill exactly the space below the header (and above the mobile bottom nav).
     */
    <div
      className="-mx-4 md:-mx-6 -mt-5 md:-mt-6"
      style={{
        height: "calc(100vh - var(--header-height))",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Page title strip — only visible on mobile when no conv is selected */}
      {!selectedId && (
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}>
          <div>
            <h1 className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Messages</h1>
            {totalUnread > 0 && (
              <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                {totalUnread} unread
              </p>
            )}
          </div>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden bg-white border-t" style={{ borderColor: "var(--color-border)" }}>

        {/* ── Left: conversation list ── */}
        <div
          className={`flex-shrink-0 border-r ${selectedId ? "hidden md:flex md:flex-col" : "flex flex-col"}`}
          style={{
            width: "100%",
            maxWidth: 320,
            borderColor: "var(--color-border)",
          }}
        >
          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between px-4 py-3.5 border-b"
            style={{ borderColor: "var(--color-border)" }}>
            <div>
              <h1 className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Messages</h1>
              {totalUnread > 0 && (
                <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                  {totalUnread} unread
                </p>
              )}
            </div>
          </div>

          <ConversationList
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* ── Right: chat panel or empty state ── */}
        {selectedId ? (
          <ChatPanel
            key={selectedId}
            convId={selectedId}
            onBack={() => setSelectedId(null)}
            onStatusChange={handleStatusChange}
          />
        ) : (
          /* Empty state — desktop only */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-3"
            style={{ background: "var(--color-bg)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "white", border: "0.5px solid var(--color-border)", color: "var(--color-text-tertiary)" }}>
              <MessageSquare size={22} />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                Select a conversation
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                Pick a customer from the left to view their messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
