"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import ChatTab from "./OrderChatTab";

export default function Chat({ orders = {}, customer = {}, loading = false }) {
  return (
    <Card className="rounded-2xl shadow-none w-full">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-lg">Chat</h2>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center">
            <Spinner className="size-8 text-blue-500" />
          </div>
        ) : (
          <ChatTab orders={orders} avatar={customer.avatar_url} loading={loading} />
        )}
      </CardContent>
    </Card>
  );
}
