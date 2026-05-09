"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui";
import useAuthStore from "@/lib/store/useAuthStore";
import { ConversationList } from "@/components/messages/ConversationList";
import { useStoreConversations } from "@/lib/hooks/useStoreMessages";

export default function StoreMessagesLayout({ children }) {
  const user = useAuthStore((s) => s.user);
  const storeId = useAuthStore((s) => s.storeId);
  const { convId } = useParams();
  const { conversations, isLoading } = useStoreConversations();

  if (!user || !storeId) {
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
          Chat with customers about their orders
        </p>
        <Link href="/auth/sign-in">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-4">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Messages
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
          Chat with customers about their orders and questions
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden">
        <div
          className="flex flex-1 overflow-hidden bg-white h-[610px]"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className={`flex-shrink-0 border-r ${
              convId ? "hidden md:flex md:flex-col" : "flex flex-col"
            }`}
            style={{ width: "100%", maxWidth: 320, borderColor: "var(--color-border)" }}
          >
            <ConversationList 
              conversations={conversations}
              isLoading={isLoading}
              selectedId={convId}
              userSide="store"
            />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden h-[610px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
