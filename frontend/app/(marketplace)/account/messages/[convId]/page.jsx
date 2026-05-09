"use client";

import { useParams, useRouter } from "next/navigation";
import { ChatPanel } from "@/components/messages/ChatPanel";
import { useBuyerConversation } from "@/lib/hooks/useBuyerMessages";

export default function MessageConversationPage() {
  const { convId } = useParams();
  const router = useRouter();
  const { conversation, messages, isLoading, sendMessage, sending } = useBuyerConversation(convId);

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
        onBack={() => router.push("/account/messages")}
        userSide="buyer"
      />
    </div>
  );
}
