"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  getLastRead,
  getOrderMessages,
  markChatAsRead,
  sendOrderMessage,
} from "@/lib/ordersApi";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/* ------------------ Message bubbles ------------------ */

function ReceivedBubble({ avatar, message }) {
  return (
    <div className="flex gap-2">
      <Image
        src={avatar}
        width={36}
        height={36}
        alt="avatar"
        className="rounded-full bg-muted object-cover"
      />
      <div className="border rounded-xl bg-muted max-w-72 p-2 text-sm">
        {message}
      </div>
    </div>
  );
}

function SentBubble({ message, createdAt, readAt }) {
  const [isRead, setIsRead] = useState(false);
  useEffect(() => {
    setIsRead(new Date(createdAt).getTime() <= new Date(readAt).getTime());
  }, [readAt]);

  return (
    <div className="flex justify-end">
      <div className="relative">
        <div className="border rounded-xl bg-primary text-primary-foreground max-w-72 p-2 text-sm">
          {message}
        </div>
        <CheckCircle
          className={
            isRead
              ? "text-primary absolute w-3 right-1"
              : "text-text absolute w-3 right-1"
          }
        />
      </div>
    </div>
  );
}

/* ------------------ Main component ------------------ */

export default function ChatTab({ orders = [] }) {
  const [selectedSto, setSelectedSto] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [lastRead, setLastRead] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const channelRef = useRef(null);

  const seller_id = selectedSto?.stores.owner_id;
  const role = "buyer";
  const { init, user } = useAuthStore();

  /* -------- Init auth once -------- */
  useEffect(() => {
    init();
  }, [init]);

  /* -------- Select first order -------- */
  useEffect(() => {
    if (orders.length > 0) {
      setSelectedSto(orders[0]);
    }
  }, [orders]);

  /* -------- Fetch messages -------- */
  const fetchMessageList = async (orderId) => {
    try {
      setFetching(true);
      const data = await getOrderMessages(orderId);
      setMessages(data ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    } finally {
      setFetching(false);
    }
  };

  /* -------- Realtime subscription -------- */
  useEffect(() => {
    if (!selectedSto?.id) return;

    setMessages([]);
    fetchMessageList(selectedSto.id);

    // Cleanup previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`order-chat-${selectedSto.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${selectedSto.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    markAsRead();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSto?.id]);

  /* -------- Scroll to bottom -------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (selectedSto === null) {
      return;
    }
    markAsRead();
  }, [messages]);

  useEffect(() => {
    if (selectedSto === null) {
      return;
    }
    markAsRead();
  }, [selectedSto]);

  const markAsRead = async () => {
    await markChatAsRead(selectedSto.id, user.id);
    const res = await getLastRead(selectedSto.id, seller_id);
    setLastRead(res.last_read_at);
    console.log(res);
  };

  /* -------- Send message -------- */
  const sendMessage = async () => {
    if (!text.trim() || !user || !selectedSto) return;

    try {
      setSending(true);

      const ok = await sendOrderMessage(selectedSto.id, user.id, role, text);

      if (!ok) throw new Error();
      setText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* -------- Order avatars -------- */}
      <div className="flex gap-4 justify-end">
        {orders.map((sto) => (
          <button
            key={sto.id}
            onClick={() => setSelectedSto(sto)}
            className="flex flex-col items-center"
          >
            <Image
              src={sto.stores.logo}
              width={36}
              height={36}
              alt={sto.stores.name}
              className="w-10 h-10 rounded-full bg-muted object-cover"
            />
            <span className="text-xs hidden md:block">{sto.stores.name}</span>
          </button>
        ))}
      </div>

      {/* -------- Messages -------- */}
      <div className="h-96 overflow-y-auto space-y-7 mt-4">
        {fetching ? (
          <p>Loading…</p>
        ) : messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((m) =>
            m.sender_role === "buyer" ? (
              <SentBubble
                key={m.id}
                message={m.message}
                createdAt={m.created_at}
                readAt={lastRead}
              />
            ) : (
              <ReceivedBubble
                key={m.id}
                avatar={selectedSto.stores.logo}
                message={m.message}
              />
            )
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* -------- Input -------- */}
      <InputGroup className="mt-3">
        <InputGroupTextarea
          placeholder="Enter message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton variant="outline" size="icon-xs">
            <IconPlus />
          </InputGroupButton>
          <InputGroupText />
          <Separator orientation="vertical" className="!h-4" />
          <InputGroupButton
            variant="default"
            size="icon-xs"
            disabled={sending}
            onClick={sendMessage}
          >
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
