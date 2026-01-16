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
  sendOrderMessageImages,
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
        width={536}
        height={536}
        alt="avatar"
        className="rounded-full w-10 h-10 bg-muted object-cover"
      />
      <div className="border rounded-xl bg-muted max-w-72 text-sm">
        {message.message_type === "image" ? (
          <Image
            src={message.file_url}
            alt="message-image"
            width={800}
            height={800}
            priority
            className="object-cover w-48 rounded-xl"
          />
        ) : (
          <p className="p-2 whitespace-pre-wrap">{message.message}</p>
        )}
      </div>
    </div>
  );
}

function SentBubble({ message, createdAt, readAt }) {
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    if (!readAt) return;
    setIsRead(new Date(createdAt).getTime() <= new Date(readAt).getTime());
  }, [readAt]);

  return (
    <div className="flex justify-end px-4">
      <div className="relative">
        <div className="border rounded-xl bg-primary text-primary-foreground max-w-72 text-sm">
          {message.message_type === "image" ? (
            <Image
              src={message.file_url}
              alt="sent-image"
              width={800}
              height={800}
              priority
              className="object-cover w-48 rounded-xl"
            />
          ) : (
            <p className="p-2 whitespace-pre-wrap">{message.message}</p>
          )}
        </div>

        {/* Read Status Icon */}
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

  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);
  const fileRef = useRef(null);

  const role = "buyer";
  const { init, user } = useAuthStore();

  /* ---------------- Auth Init ---------------- */
  useEffect(() => {
    init();
  }, [init]);

  /* ---------------- Default selected order ---------------- */
  useEffect(() => {
    if (orders.length > 0) setSelectedSto(orders[0]);
  }, [orders]);

  /* ---------------- Fetch Messages ---------------- */
  const fetchMessageList = async (orderId) => {
    try {
      setFetching(true);
      const data = await getOrderMessages(orderId);
      setMessages(data ?? []);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setFetching(false);
    }
  };

  /* ---------------- Realtime Updates ---------------- */
  useEffect(() => {
    if (!selectedSto?.id) return;

    setMessages([]);
    fetchMessageList(selectedSto.id);

    // remove old channel
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
          const newMessage = payload.new;

          // Prevent duplicates
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    markAsRead();

    return () => supabase.removeChannel(channel);
  }, [selectedSto?.id]);

  /* ---------------- Scroll to bottom ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (selectedSto) markAsRead();
  }, [messages]);

  /* ---------------- Mark as read ---------------- */
  const markAsRead = async () => {
    await markChatAsRead(selectedSto.id, user.id);
    const res = await getLastRead(selectedSto.id, selectedSto.stores.owner_id);
    setLastRead(res.last_read_at);
  };

  /* ---------------- Send Text Message ---------------- */
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

  /* ---------------- File Upload Handler ---------------- */
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5);

    if (files.length === 0) return;

    if (files.some((f) => !f.type.startsWith("image"))) {
      toast.error("Only image files are allowed");
      return;
    }

    // 1️⃣ Show uploading placeholder
    const uploadPlaceholder = {
      id: "__uploading__",
      sender_role: role,
      message_type: "uploading",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, uploadPlaceholder]);

    // Prepare formData
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("userId", user.id);
    formData.append("role", role);

    abortRef.current = new AbortController();

    let response;

    try {
      setSending(true);

      response = await sendOrderMessageImages(
        selectedSto.id,
        formData,
        abortRef.current.signal
      );

      if (!response) throw new Error("Upload failed");
    } catch (err) {
      if (err.name === "AbortError") {
        toast.error("Upload cancelled due to network issue");
      } else {
        toast.error("Failed to upload image(s)");
      }

      // Remove placeholder
      setMessages((prev) => prev.filter((msg) => msg.id !== "__uploading__"));

      fileRef.current.value = null;
      setSending(false);
      return;
    }

    // const uploadedMessages = await response.json();
    console.log("now removing placeholder")

    // 2️⃣ Remove placeholder after success
    setMessages((prev) => prev.filter((msg) => msg.id !== "__uploading__"));

    console.log("placeholder removed")
    setSending(false);
    fileRef.current.value = null;

    // Realtime listener will append the uploaded messages normally
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Store avatars at the top */}
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
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-xs hidden md:block">{sto.stores.name}</span>
          </button>
        ))}
      </div>

      {/* ---------------- Messages List ---------------- */}
      <div className="h-96 overflow-y-auto space-y-7 mt-4">
        {fetching ? (
          <p>Loading…</p>
        ) : messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((m) =>
            m.id === "__uploading__" ? (
              <div key="uploading" className="flex justify-end px-4 opacity-70">
                <div className="border rounded-xl bg-primary text-primary-foreground p-2 text-sm">
                  Uploading images…
                </div>
              </div>
            ) : m.sender_role === "buyer" ? (
              <SentBubble
                key={m.id}
                message={m}
                createdAt={m.created_at}
                readAt={lastRead}
              />
            ) : (
              <ReceivedBubble
                key={m.id}
                avatar={selectedSto.stores.logo}
                message={m}
              />
            )
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* ---------------- Input Section ---------------- */}
      <InputGroup className="mt-3">
        <InputGroupTextarea
          placeholder="Enter message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="outline"
            size="icon-xs"
            onClick={() => fileRef.current.click()}
          >
            <IconPlus />
          </InputGroupButton>

          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileRef}
            className="hidden"
            onChange={handleFiles}
          />

          <Separator orientation="vertical" className="!h-4" />

          <InputGroupButton
            variant="default"
            size="icon-xs"
            className="rounded-full"
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
