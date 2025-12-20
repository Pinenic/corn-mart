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

function ReceivedBubble({ avatar, text }) {
  return (
    <div className="flex gap-2">
      <Image
        src={avatar}
        width={50}
        height={50}
        alt={"avatar"}
        className="rounded-full w-9 h-9 bg-muted object-cover"
      />
      <div className="flex-start border rounded-xl bg-muted max-w-64 md:max-w-72 p-2 text-sm">
        {text.message}
      </div>
    </div>
  );
}

function SentBubble({ text }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="align-end border rounded-xl bg-primary max-w-64 md:max-w-72 p-2 text-sm">
        {text.message}
      </div>
    </div>
  );
}

export default function ChatTab({ orders }) {
  const [selectedSto, setSelectedSto] = useState(orders[0]);
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef();

  const role = "buyer";
  const { init, user } = useAuthStore();

  const fetchMessageList = async () => {
    try {
      setFetching(true);
      const data = await getOrderMessages(selectedSto.id);
      setMessages(data);
      console.log(data);
      setFetching(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  const sendMessage = async () => {
    try {
      setSending(true);
      await init();
      if (text.trim()) {
        const response = await sendOrderMessage(
          selectedSto.id,
          user.id,
          role,
          text
        );
        response
          ? toast.success("Message sent")
          : toast.error("Something went wrong");
      } else console.log("text is empty");

      setSending(false);
      setText("");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
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
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSto]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <>
      <div className="flex flex-col w-full h-3xl md:h-2xl">
        <div className="flex justify-end gap-4">
          {orders.map((sto) => (
            <div
              className="flex md:flex-col md:items-center"
              key={sto.id}
              onClick={() => setSelectedSto(sto)}
            >
              <Image
                src={sto.stores.logo}
                width={50}
                height={50}
                alt={sto.stores.name}
                className="rounded-full w-9 h-9 bg-muted object-cover"
              />
              <p className="text-xs hidden md:flex">{sto.stores.name}</p>
            </div>
          ))}
        </div>
        <div className=" w-full h-88 space-y-4 overflow-y-scroll mt-5">
          {fetching ? (
            <p>Loading...</p>
          ) : (
            <>
              {messages.length == 0 ? (
                <p>No messages in this chat.</p>
              ) : (
                <>
                  {messages.map((m) =>
                    m.sender_role == "buyer" ? (
                      <SentBubble text={m} />
                    ) : (
                      <ReceivedBubble
                        avatar={selectedSto.stores.logo}
                        text={m}
                      />
                    )
                  )}
                </>
              )}
            </>
          )}
          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
        <>
          <InputGroup>
            <InputGroupTextarea
              placeholder="Enter message..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            />
            <InputGroupAddon align="block-end">
              <InputGroupButton
                variant="outline"
                className="rounded-full"
                size="icon-xs"
              >
                <IconPlus />
              </InputGroupButton>
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <InputGroupButton variant="ghost">Auto</InputGroupButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="[--radius:0.95rem]"
                >
                  <DropdownMenuItem>Auto</DropdownMenuItem>
                  <DropdownMenuItem>Agent</DropdownMenuItem>
                  <DropdownMenuItem>Manual</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
              <InputGroupText className="ml-auto"></InputGroupText>
              <Separator orientation="vertical" className="!h-4" />
              <InputGroupButton
                variant="default"
                className="rounded-full"
                size="icon-xs"
                disabled={sending}
                onClick={() => sendMessage()}
              >
                <ArrowUpIcon />
                <span className="sr-only">Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </>
      </div>
    </>
  );
}
