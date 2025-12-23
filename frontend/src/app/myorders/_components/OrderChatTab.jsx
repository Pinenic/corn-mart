"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { getOrderMessages, sendOrderMessage } from "@/lib/ordersApi";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon } from "lucide-react";
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

function SentBubble({ message }) {
  return (
    <div className="flex justify-end">
      <div className="border rounded-xl bg-primary text-primary-foreground max-w-72 p-2 text-sm">
        {message}
      </div>
    </div>
  );
}

/* ------------------ Main component ------------------ */

export default function ChatTab({ orders = [] }) {
  const [selectedSto, setSelectedSto] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const channelRef = useRef(null);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSto?.id]);

  /* -------- Scroll to bottom -------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* -------- Send message -------- */
  const sendMessage = async () => {
    if (!text.trim() || !user || !selectedSto) return;

    try {
      setSending(true);

      const ok = await sendOrderMessage(
        selectedSto.id,
        user.id,
        role,
        text
      );

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
              className="rounded-full bg-muted object-cover"
            />
            <span className="text-xs hidden md:block">
              {sto.stores.name}
            </span>
          </button>
        ))}
      </div>

      {/* -------- Messages -------- */}
      <div className="flex-1 overflow-y-auto space-y-4 mt-4">
        {fetching ? (
          <p>Loading…</p>
        ) : messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((m) =>
            m.sender_role === "buyer" ? (
              <SentBubble key={m.id} message={m.message} />
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
