"use client";
import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import { useBuyerOrders }  from "@/lib/hooks/useBuyerOrders";
import { OrderCard }       from "@/components/orders/OrderCard";
import { Button, Spinner, EmptyState } from "@/components/ui";
import useAuthStore from "@/lib/store/useAuthStore";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { key: "all",       label: "All"        },
  { key: "pending",   label: "Pending"    },
  { key: "shipped",   label: "Shipped"    },
  { key: "delivered", label: "Delivered"  },
  { key: "cancelled", label: "Cancelled"  },
];

export default function OrdersPage() {
  const user = useAuthStore(s => s.user);
  const [status, setStatus] = useState("all");
  const [page, setPage]     = useState(1);

  const { orders, meta, isLoading } = useBuyerOrders({ page, status: status === "all" ? undefined : status });

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-20 text-center">
        <ShoppingBag size={48} className="text-[var(--color-text-muted)] mx-auto mb-4" />
        <h2 className="text-[20px] font-bold text-[var(--color-text-primary)] mb-2">Sign in to view your orders</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">Track your purchases and order history in one place</p>
        <Link href="/auth/sign-in"><Button>Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">My Orders</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">Track and manage your purchases</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: "none" }}>
        {STATUS_TABS.map(tab => (
          <button key={tab.key} onClick={() => { setStatus(tab.key); setPage(1); }}
            className={cn("flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-medium transition-all border", status === tab.key ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]")}>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={status === "all" ? "No orders yet" : `No ${status} orders`}
          description={status === "all" ? "Your orders will appear here once you start shopping" : `You don't have any ${status} orders`}
          action={<Link href="/marketplace/products"><Button>Browse products</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</Button>
          <span className="text-[13px] text-[var(--color-text-secondary)] px-2">Page {page} of {meta.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next ›</Button>
        </div>
      )}
    </div>
  );
}
