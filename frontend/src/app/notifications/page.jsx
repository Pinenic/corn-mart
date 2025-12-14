"use client";
import { useEffect, useState } from "react";
import NotificationCard from "@/components/notifications/NotificationCard";
import { sampleNotifications } from "@/lib/sampleNotifications";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/useNotificationStore";
import { getBuyerNotifications, readAll, readOne } from "@/lib/notificationsApi";
import { useAuthStore } from "@/store/useAuthStore";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const { init, user } = useAuthStore();
  const userId = user?.id;
  const [notificationz, setNotificationz] = useState([]);
  const [fetching, setFetching] = useState(false);
  // const  = getBuyerNotifications(userId)

  const fetchNotifications = async () => {
    try {
      setFetching(true)
      const data = await getBuyerNotifications(userId);
      setNotificationz(data);
      setFetching(false);
    } catch (error) {
      console.error(error);
    }
  };

    const refreshNotifications = async () => {
    try {
      const data = await getBuyerNotifications(userId);
      setNotificationz(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkRead = async (id) => {
    const res = await readOne(id);
    if(res) {
      refreshNotifications()
    }
  };

  const handleMarkAll = async () => {
    const res = await readAll(userId);
    if(res) {
      refreshNotifications()
    }
  };

  useEffect(()=>{
    if(!user){
      init();
    }
    fetchNotifications()
  },[user])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-muted-foreground">Notifications</h1>
        <Button variant="outline" onClick={handleMarkAll}>
          Mark all as read
        </Button>
      </div>

      <div>
        {notificationz.length ? (
          notificationz.map((item) => (
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
