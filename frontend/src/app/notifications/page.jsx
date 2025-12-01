"use client";
import { useState } from "react";
import NotificationCard from "@/components/notifications/NotificationCard";
import { sampleNotifications } from "@/lib/sampleNotifications";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications);

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <Button variant="outline" onClick={handleMarkAll}>
          Mark all as read
        </Button>
      </div>

      <div>
        {notifications.length ? (
          notifications.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              onMarkRead={handleMarkRead}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No notifications yet 📭
          </p>
        )}
      </div>
    </div>
  );
}
