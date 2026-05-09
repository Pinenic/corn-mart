"use client";
import Link from "next/link";
import { MessageCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui";
import useAuthStore from "@/lib/store/useAuthStore";

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 text-center">
        <MessageCircle
          size={48}
          className="text-[var(--color-text-muted)] mx-auto mb-4"
        />
        <h2 className="text-[20px] font-bold text-[var(--color-text-primary)] mb-2">
          Sign in to access messages
        </h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
          Chat directly with sellers about your orders
        </p>
        <Link href="/auth/sign-in">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 hidden md:flex flex-col items-center justify-center gap-3"
      style={{ background: "var(--color-bg)" }}>
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
      <div className="text-center px-6">
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
          Pick a customer from the list on the left to open a chat.
        </p>
      </div>
    </div>
  );
}
