"use client";
import { Bell, Package, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationCard({ item, onMarkRead }) {
  const icons = {
    order: <Package className="text-blue-500" />,
    promo: <Tag className="text-amber-500" />,
    default: <Bell className="text-gray-400" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border rounded-xl mb-3 transition-all",
        item.read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
      )}
    >
      <div>{icons[item.type] || icons.default}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{item.title}</h4>
        <p className="text-sm text-gray-600">{item.message}</p>
        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
      </div>
      {!item.read && (
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
