"use client";
import { Bell, Package, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationCard({ item, onMarkRead }) {
  const icons = {
    order_update: <Package className="text-blue-500" />,
    promo: <Tag className="text-amber-500" />,
    default: <Bell className="text-gray-400" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border rounded-xl mb-3 transition-all",
        item.is_read ? "bg-gray-50 dark:bg-muted" : "bg-blue-50 dark:bg-chart-1/10 border-blue-200"
      )}
    >
      <div>{icons[item.type] || icons.default}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-muted-foreground">{item.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{item.message}</p>
        <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}</p>
      </div>
      {!item.is_read && (
        <button
          onClick={() => onMarkRead(item.id)}
          className="text-xs text-blue-600 hover:underline"
        >
          Mark as read
        </button>
      )}
    </div>
  );
}
