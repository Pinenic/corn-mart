"use client";
import { useEffect, useState } from "react";
import NotificationCard from "@/components/notifications/NotificationCard";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  getSellerNotifications,
  readAll,
  readOne,
} from "@/lib/notificationsApi";
import { useAuthStore } from "@/store/useAuthStore";
import { SiteHeader } from "@/components/site-header";
import { useStoreStore } from "@/store/useStore";

export default function Page() {
  useEffect(() => {
    document.title = "Notifications | Corn Mart";
  }, []);
  const [notifications, setNotifications] = useState([]);
  const { init, user } = useAuthStore();
  const userId = user?.id;
  const [notificationz, setNotificationz] = useState([]);
  const [fetching, setFetching] = useState(false);
    const { store } = useStoreStore();
    const storeId = store?.id;
  // const  = getBuyerNotifications(userId)

  const fetchNotifications = async () => {
    try {
      setFetching(true);
      const data = await getSellerNotifications(userId);
      setNotificationz(data);
      setFetching(false);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshNotifications = async () => {
    try {
      const data = await getSellerNotifications(userId);
      setNotificationz(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkRead = async (id) => {
    const res = await readOne(id);
    if (res) {
      refreshNotifications();
    }
  };

  const handleMarkAll = async () => {
    const res = await readAll(userId);
    if (res) {
      refreshNotifications();
    }
  };

  useEffect(() => {
    if (!user) {
      init();
      return;
    }
    fetchNotifications();
  }, [user]);

  return (
    <>
      <SiteHeader title={"Notifications"} storeId={storeId} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Notifications
          </h1>
          <Button variant="outline" onClick={handleMarkAll}>
            Mark all as read
          </Button>
        </div>

        <div>
          {fetching ? (
            <p>loading...</p>
          ) : notificationz.length ? (
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
    </>
  );
}
