"use client";
import { Bell, CheckCheck, Package, ShoppingBag, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Drawer } from "@/components/ui/Modal";
import { Button, Spinner } from "@/components/ui";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/hooks/useNotifications";
import { formatDate, cn } from "@/lib/utils";

const TYPE_ICONS = {
  success: { Icon: CheckCircle,  bg: "var(--color-success-bg)",  color: "var(--color-success)"  },
  warning: { Icon: AlertTriangle,bg: "var(--color-warning-bg)",  color: "var(--color-warning)"  },
  error:   { Icon: AlertTriangle,bg: "var(--color-danger-bg)",   color: "var(--color-danger)"   },
  info:    { Icon: Info,          bg: "var(--color-info-bg)",     color: "var(--color-info)"     },
};

function NotifItem({ notif, onRead }) {
  const cfg = TYPE_ICONS[notif.type] ?? TYPE_ICONS.info;
  const Icon = cfg.Icon;

  return (
    <button
      onClick={() => !notif.is_read && onRead(notif.id)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--color-bg)] border-b border-[var(--color-border)] last:border-0",
        !notif.is_read && "bg-[var(--color-primary-light)]/30"
      )}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg }}>
        <Icon size={16} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[13px] leading-snug", notif.is_read ? "text-[var(--color-text-secondary)] font-normal" : "text-[var(--color-text-primary)] font-semibold")}>
          {notif.title}
        </p>
        {notif.message && (
          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
        )}
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{formatDate(notif.created_at)}</p>
      </div>
      {!notif.is_read && (
        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-2" />
      )}
    </button>
  );
}

export function NotifDrawer({ open, onClose }) {
  const { notifications, unread, isLoading, mutate } = useNotifications();
  const { markRead }  = useMarkNotificationRead();
  const { markAll }   = useMarkAllNotificationsRead();

  const handleRead = (id) => markRead(id, mutate);
  const handleAll  = ()   => markAll(mutate);

  return (
    <Drawer open={open} onClose={onClose} title={`Notifications${unread > 0 ? ` (${unread})` : ""}`} side="right">
      {/* Mark all read */}
      {unread > 0 && (
        <div className="px-4 py-2 border-b border-[var(--color-border)] flex justify-end">
          <button onClick={handleAll} className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-primary)] hover:underline">
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center mb-4">
              <Bell size={22} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">All caught up</p>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map(n => <NotifItem key={n.id} notif={n} onRead={handleRead} />)}
          </div>
        )}
      </div>
    </Drawer>
  );
}
