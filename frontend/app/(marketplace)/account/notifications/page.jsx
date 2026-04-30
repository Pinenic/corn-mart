"use client";
import Link from "next/link";
import { Bell, CheckCheck, CheckCircle, AlertCircle, AlertTriangle, Info, ArrowLeft } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/hooks/useNotifications";
import { Button, Spinner, Badge } from "@/components/ui";
import useAuthStore from "@/lib/store/useAuthStore";
import { formatDate, cn } from "@/lib/utils";
import { useState } from "react";

const TYPE_CONFIG = {
  success: { Icon: CheckCircle,  bg: "var(--color-success-bg)",  color: "var(--color-success)",  label: "Success" },
  warning: { Icon: AlertTriangle,bg: "var(--color-warning-bg)",  color: "var(--color-warning)",  label: "Warning" },
  error:   { Icon: AlertCircle,  bg: "var(--color-danger-bg)",   color: "var(--color-danger)",   label: "Alert"   },
  info:    { Icon: Info,          bg: "var(--color-info-bg)",     color: "var(--color-info)",     label: "Info"    },
};

const FILTER_TABS = [
  { key: "all",     label: "All"      },
  { key: "unread",  label: "Unread"   },
  { key: "info",    label: "Info"     },
  { key: "success", label: "Success"  },
  { key: "warning", label: "Warnings" },
];

function NotificationRow({ notif, onRead }) {
  const cfg  = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;
  const Icon = cfg.Icon;

  return (
    <div
      onClick={() => !notif.is_read && onRead(notif.id)}
      className={cn(
        "flex items-start gap-4 px-5 py-4 border-b border-[var(--color-border)] last:border-0 transition-colors",
        !notif.is_read ? "bg-[var(--color-primary-light)]/20 cursor-pointer hover:bg-[var(--color-primary-light)]/40" : "bg-white hover:bg-[var(--color-bg)] cursor-default"
      )}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg }}>
        <Icon size={18} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={cn("text-[14px] leading-snug", notif.is_read ? "text-[var(--color-text-secondary)] font-normal" : "text-[var(--color-text-primary)] font-semibold")}>
            {notif.title}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">{formatDate(notif.created_at)}</span>
            {!notif.is_read && (
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
            )}
          </div>
        </div>
        {notif.message && (
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">{notif.message}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={notif.type === "success" ? "success" : notif.type === "warning" ? "warning" : notif.type === "error" ? "danger" : "info"}>
            {cfg.label}
          </Badge>
          {notif.channel && notif.channel !== "in_app" && (
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">{notif.channel}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const user = useAuthStore(s => s.user);
  const [filterTab, setFilter] = useState("all");
  const [page, setPage]        = useState(1);

  const { notifications, meta, unread, isLoading, mutate } = useNotifications({
    type:    filterTab === "unread" ? undefined : filterTab === "all" ? undefined : filterTab,
    is_read: filterTab === "unread" ? false : undefined,
    page, limit: 20,
  });

  const { markRead } = useMarkNotificationRead();
  const { markAll  } = useMarkAllNotificationsRead();

  const handleRead    = (id)  => markRead(id, mutate);
  const handleMarkAll = ()    => markAll(mutate);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 text-center">
        <Bell size={48} className="text-[var(--color-text-muted)] mx-auto mb-4" />
        <h2 className="text-[20px] font-bold text-[var(--color-text-primary)] mb-2">Sign in to view notifications</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">Stay up to date with your orders and activity</p>
        <Link href="/auth/sign-in"><Button>Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            Notifications
            {unread > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? "s" : ""}` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAll}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "none" }}>
        {FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => { setFilter(tab.key); setPage(1); }}
            className={cn("flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all border", filterTab === tab.key ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]")}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center mb-4">
              <Bell size={26} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
              {filterTab === "unread" ? "No unread notifications" : "No notifications"}
            </p>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
              {filterTab === "unread" ? "You've read everything — nice work!" : "Notifications about your orders will appear here"}
            </p>
            {filterTab !== "all" && (
              <button onClick={() => setFilter("all")} className="mt-4 text-[13px] font-medium text-[var(--color-primary)] hover:underline">
                View all notifications
              </button>
            )}
          </div>
        ) : (
          notifications.map(n => <NotificationRow key={n.id} notif={n} onRead={handleRead} />)
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</Button>
          <span className="text-[13px] text-[var(--color-text-secondary)] px-2">Page {page} of {meta.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next ›</Button>
        </div>
      )}
    </div>
  );
}
