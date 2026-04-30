"use client";
import Link from "next/link";
import { MessageCircle, Lock, Hammer, ArrowRight, Bell } from "lucide-react";
import { Button } from "@/components/ui";
import useAuthStore from "@/lib/store/useAuthStore";

export default function MessagesPage() {
  const user = useAuthStore(s => s.user);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 text-center">
        <MessageCircle size={48} className="text-[var(--color-text-muted)] mx-auto mb-4" />
        <h2 className="text-[20px] font-bold text-[var(--color-text-primary)] mb-2">Sign in to access messages</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">Chat directly with sellers about your orders</p>
        <Link href="/auth/sign-in"><Button>Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">Messages</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">Chat with sellers about your orders and questions</p>
      </div>

      {/* Coming soon shell */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden">
        {/* Two-panel layout preview */}
        <div className="flex h-[520px]">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-[var(--color-border)]">
              <div className="h-9 rounded-xl bg-[var(--color-bg)] flex items-center px-3 gap-2">
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--color-border-md)]" />
                <div className="h-2.5 w-24 rounded bg-[var(--color-border)] animate-pulse" />
              </div>
            </div>

            {/* Placeholder conversation rows */}
            <div className="flex-1 overflow-hidden">
              {[
                { initials: "AK", name: "Ama's Boutique",    preview: "Thanks for your order!",     unread: 2 },
                { initials: "JM", name: "Tech Corner",       preview: "Your item has shipped",       unread: 0 },
                { initials: "LN", name: "Lena's Crafts",     preview: "I can offer a discount…",     unread: 1 },
                { initials: "RT", name: "Reuben Electronics",preview: "Let me check availability",   unread: 0 },
              ].map((conv, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] ${i === 0 ? "bg-[var(--color-primary-light)]" : ""}`}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {conv.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{conv.name}</p>
                      <span className="text-[10px] text-[var(--color-text-muted)]">2m</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{conv.preview}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main pane — coming soon overlay */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* Fake chat bubbles in background */}
            <div className="absolute inset-0 p-6 space-y-4 opacity-20 pointer-events-none overflow-hidden">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-400 flex-shrink-0" />
                <div className="bg-[var(--color-bg)] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs">
                  <div className="h-2.5 w-40 rounded bg-[var(--color-border-md)]" />
                  <div className="h-2 w-24 rounded bg-[var(--color-border)] mt-1.5" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-[var(--color-primary)] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">
                  <div className="h-2.5 w-32 rounded bg-white/40" />
                </div>
                <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)] flex-shrink-0" />
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-400 flex-shrink-0" />
                <div className="bg-[var(--color-bg)] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs">
                  <div className="h-2.5 w-48 rounded bg-[var(--color-border-md)]" />
                  <div className="h-2 w-36 rounded bg-[var(--color-border)] mt-1.5" />
                  <div className="h-2 w-20 rounded bg-[var(--color-border)] mt-1.5" />
                </div>
              </div>
            </div>

            {/* Coming soon card */}
            <div className="relative z-10 text-center px-8 py-10 bg-white/95 backdrop-blur-sm rounded-3xl border border-[var(--color-border)] shadow-xl max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Hammer size={28} className="text-white" />
              </div>
              <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-2">Messaging coming soon</h2>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
                Direct buyer–seller chat is in development. Once live, you'll be able to message any store about products, orders, or custom requests.
              </p>

              {/* What's coming */}
              <div className="space-y-2.5 text-left mb-6">
                {[
                  "Message sellers directly about orders",
                  "Ask product questions before buying",
                  "Attach order references to messages",
                  "Real-time notifications for replies",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-[var(--color-text-secondary)]">
                    <div className="w-4 h-4 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <Link href="/account/notifications">
                <Button variant="outline" className="w-full">
                  <Bell size={14} />
                  Get notified when it launches
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* In the meantime */}
      <div className="mt-6 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] p-5">
        <p className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-1">In the meantime</p>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">
          Use the contact details on each store's profile page to reach sellers directly.
        </p>
        <Link href="/marketplace/stores" className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-primary)] hover:underline">
          Browse stores <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
