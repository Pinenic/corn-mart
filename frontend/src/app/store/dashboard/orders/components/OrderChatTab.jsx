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

/* -------------------- Bubbles -------------------- */

function ReceivedBubble({ avatar, text }) {
  return (
    <div className="flex gap-2">
      <Image
        src={avatar}
        width={50}
        height={50}
        alt="avatar"
        className="rounded-full w-9 h-9 bg-muted object-cover"
        unoptimized
      />
      <div className="border rounded-xl bg-muted max-w-64 md:max-w-72 text-sm">
        {text.message_type == "image" ? (
          <Image
            src={text.file_url}
            alt="product image"
            width={800}
            height={800}
            priority
            className="object-cover w-48 rounded-xl"
          />
        ) : (
          <p className="p-2">{text.message}</p>
        )}
      </div>
    </div>
  );
}

function SentBubble({ text, createdAt, readAt }) {
  const [isRead, setIsRead] = useState(false);
  useEffect(() => {
    setIsRead(new Date(createdAt).getTime() <= new Date(readAt).getTime());
  }, [readAt]);
  return (
    <div className="flex justify-end">
      <div className="relative">
        <div className="border rounded-xl bg-primary text-primary-foreground max-w-72 text-sm">
          {text.message_type == "image" ? (
            <Image
              src={text.file_url}
              alt="product image"
              width={800}
              height={800}
              priority
              className="object-cover w-48 rounded-xl"
            />
          ) : (
            <p className="p-2">{text.message}</p>
          )}
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

/* -------------------- Main Component -------------------- */

export default function ChatTab({ orders, avatar }) {
  const [selectedSto, setSelectedSto] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [lastRead, setLastRead] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const abortRef = useRef(null);

  const role = "seller";
  const { init, user } = useAuthStore();

  /* -------- Sync orders → selectedSto -------- */
  useEffect(() => {
    if (orders?.id) {
      setSelectedSto(orders);
    }
  }, [orders]);

  /* -------- Fetch messages -------- */
  const fetchMessageList = async () => {
    try {
      setFetching(true);
      const data = await getOrderMessages(selectedSto.id);
      setMessages(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setFetching(false);
    }
  };

  /* -------- Send message -------- */
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      setSending(true);
      await init();

      const response = await sendOrderMessage(
        selectedSto.id,
        user.id,
        role,
        text
      );

      response
        ? toast.success("Message sent")
        : toast.error("Something went wrong");

      setText("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  /* ---------File handler -------- */
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
    console.log("now removing placeholder");

    // 2️⃣ Remove placeholder after success
    setMessages((prev) => prev.filter((msg) => msg.id !== "__uploading__"));

    console.log("placeholder removed");
    setSending(false);
    fileRef.current.value = null;

    // Realtime listener will append the uploaded messages normally
  };

  /* -------- Realtime + initial fetch -------- */
  useEffect(() => {
    if (!selectedSto?.id) return;

    setMessages([]);
    fetchMessageList();

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
    markAsRead();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSto?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
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
    const res = await getLastRead(selectedSto.id, selectedSto.buyer_id);
    setLastRead(res.last_read_at);
    console.log(res);
  };

  /* -------- Guard render -------- */
  if (!selectedSto) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading chat…</p>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="flex flex-col w-full h-3xl md:h-2xl">
      {/* Messages */}
      <div className="w-full h-88 space-y-7 overflow-y-scroll mt-5">
        {fetching ? (
          <p>Loading...</p>
        ) : messages.length === 0 ? (
          <p>No messages in this chat.</p>
        ) : (
          messages.map((m) =>
            m.id === "__uploading__" ? (
              <div key="uploading" className="flex justify-end px-4 opacity-70">
                <div className="border rounded-xl bg-primary text-primary-foreground p-2 text-sm">
                  Uploading images…
                </div>
              </div>
            ) : m.sender_role === "seller" ? (
              <SentBubble
                key={m.id}
                text={m}
                createdAt={m.created_at}
                readAt={lastRead}
              />
            ) : (
              <ReceivedBubble key={m.id} avatar={avatar} text={m} />
            )
          )
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputGroup>
        <InputGroupTextarea
          placeholder="Enter message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="outline"
            className="rounded-full"
            size="icon-xs"
            onClick={() => fileRef.current.click()}
          >
            <IconPlus />
          </InputGroupButton>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileRef}
            className="hidden"
            onChange={handleFiles}
          />

          <InputGroupText className="ml-auto" />
          <Separator orientation="vertical" className="!h-4" />

          <InputGroupButton
            variant="default"
            className="rounded-full"
            size="icon-xs"
            disabled={sending}
            onClick={sendMessage}
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
