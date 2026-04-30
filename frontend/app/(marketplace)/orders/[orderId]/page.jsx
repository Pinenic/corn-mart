"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, AlertCircle } from "lucide-react";
import { useBuyerOrder, useCancelOrder } from "@/lib/hooks/useBuyerOrders";
import { OrderTimeline } from "@/components/orders/OrderCard";
import { Button, Badge, OrderStatusBadge, Skeleton } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ChevronUp } from "lucide-react";
import { ChevronDown } from "lucide-react";

export default function OrderDetailPage({ params }) {
  const { orderId } = use(params);
  const { order, isLoading, error, mutate } = useBuyerOrder(orderId);
  const { cancel, loading: cancelling } = useCancelOrder();
  const [expandedId, setExpandedId] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const [reason, setReason] = useState("");

  const handleCancel = async () => {
    const result = await cancel(toCancel, reason);
    if (result) {
      mutate();
      setCancelModal(false);
    }
  };

  const orderToCancel = (id) => {
    if(!id) return;
    setToCancel(id);
    setCancelModal(true);
  }

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const canCancel =
    order && ["pending", "confirmed"].includes(order.status?.toLowerCase());

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-5">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 text-center">
        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-2">
          Order not found
        </h2>
        <Link href="/orders">
          <Button variant="secondary">Back to orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      {/* Back */}
      <Link
        href="/orders"
        className="flex items-center gap-2 text-[13px] font-medium text-[var(--color-primary)] hover:underline mb-6"
      >
        <ArrowLeft size={14} /> Back to orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Store orders */}
      {(order.store_orders ?? []).map((so) => {
        const isExpanded = expandedId === so.id;
        return (
          <div
            key={so.id}
            className="bg-white rounded-2xl border border-[var(--color-border)] mb-4 overflow-hidden"
            onClick={() => toggleExpand(so.id)}
          >
            {/* Store header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <Link
                href={`/marketplace/stores/${so.store_id}`}
                className="flex items-center gap-2 hover:underline"
              >
                {so.store?.logo ? (
                  <img
                    src={so.store.logo}
                    alt=""
                    className="w-6 h-6 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                    {so.store?.name?.[0]}
                  </div>
                )}
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                  {so.store?.name ?? "Store"}
                </span>
              </Link>{" "}
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={so.status} />
                {isExpanded ? (
                  <ChevronUp
                    size={14}
                    style={{
                      color: "var(--color-text-tertiary)",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <ChevronDown
                    size={14}
                    style={{
                      color: "var(--color-text-tertiary)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-[var(--color-border)]">
              {(so.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-bg)] flex-shrink-0 overflow-hidden">
                    {item.product?.thumbnail_url ? (
                      <img
                        src={item.product.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package
                        size={20}
                        className="m-auto mt-3 text-[var(--color-text-muted)]"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
                      {item.product?.name}
                    </p>
                    {item.variant?.name && (
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {item.variant.name}
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-[var(--color-text-primary)] flex-shrink-0">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            {isExpanded && (
              <div className="bg-white rounded-2xl border-[var(--color-border)] p-5 mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                  Order progress
                </p>
                <OrderTimeline status={so.status} />
              </div>
            )}

            {/* Store subtotal */}
            <div className="flex justify-between items-center px-5 py-3 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
              {canCancel && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => orderToCancel(so.id)}
                >
                  Cancel order
                </Button>
              )}
              <div className="flex items-end gap-5">
                <span className="text-[12px] text-[var(--color-text-muted)]">
                  Store subtotal
                </span>
                <span className="text-[14px] font-bold text-[var(--color-text-primary)]">
                  {formatPrice(so.subtotal)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Shipping */}
      {order.store_orders?.[0]?.shipping_info &&
        Object.keys(order.store_orders[0].shipping_info).length > 0 && (
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Delivering to
            </p>
            <div className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
              <MapPin
                size={14}
                className="mt-0.5 flex-shrink-0 text-[var(--color-primary)]"
              />
              <p>
                {Object.values(order.store_orders[0].shipping_info)
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        )}

      {/* Total */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 flex justify-between items-center">
        <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
          Order total
        </span>
        <span className="text-[20px] font-bold text-[var(--color-primary)]">
          {formatPrice(order.total_amount)}
        </span>
      </div>

      {/* Cancel modal */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel order"
        size="sm"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-warning-bg)] border border-[var(--color-warning)]">
            <AlertCircle
              size={16}
              className="text-[var(--color-warning)] flex-shrink-0 mt-0.5"
            />
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[var(--color-text-secondary)] block mb-1">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Let the seller know why you're cancelling…"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setCancelModal(false)}
            >
              Keep order
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={cancelling}
              onClick={handleCancel}
            >
              Yes, cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
