"use client";

import { useParams, useRouter } from "next/navigation";
import { ChatPanel } from "@/components/messages/ChatPanel";
import { useStoreConversation } from "@/lib/hooks/useStoreMessages";

export default function StoreConversationPage() {
  const { convId } = useParams();
  const router = useRouter();
  const { conversation, messages, isLoading, sendMessage, sending } = useStoreConversation(convId);

  if (!convId) return null;

  return (
    <div className="h-full flex">
      <ChatPanel
        convId={convId}
        conversation={conversation}
        messages={messages}
        isLoading={isLoading}
        sending={sending}
        sendMessage={sendMessage}
        onBack={() => router.push("/dashboard/messages")}
        userSide="store"
      />
    </div>
  );
}
