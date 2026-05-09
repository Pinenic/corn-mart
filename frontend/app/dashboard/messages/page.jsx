"use client";

import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div
      className="hidden md:flex flex-1 flex-col items-center justify-center gap-3"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "white",
          border: "0.5px solid var(--color-border)",
          color: "var(--color-text-tertiary)",
        }}
      >
        <MessageSquare size={22} />
      </div>
      <div className="text-center">
        <p
          className="text-[14px] font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          Select a conversation
        </p>
        <p
          className="text-[12px] mt-0.5"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Pick a customer from the left to view their messages
        </p>
      </div>
    </div>
  );
}
