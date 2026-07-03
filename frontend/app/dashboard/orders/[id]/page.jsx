"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  MapPin,
  CreditCard,
  MessageSquare,
  Check,
  Clock,
  RotateCcw,
  Package,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { ORDERS, STATUS_CONFIG } from "@/lib/orders-data";
import { notFound } from "next/navigation";
import { useOrder } from "@/lib/hooks/useOrders";
import { Phone } from "lucide-react";

function Section({ title, children }) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function Avatar({ customer }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
      style={{ background: customer.avatarBg, color: customer.avatarColor }}
    >
      <img src={customer.avatar_url} alt="item" className="rounded-full" />
    </div>
  );
}

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const { data, isLoading, error } = useOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div
          className="h-6 w-48 rounded-lg"
          style={{ background: "var(--color-bg)" }}
        />
        <div
          className="h-32 rounded-2xl"
          style={{ background: "var(--color-bg)" }}
        />
        <div
          className="h-64 rounded-2xl"
          style={{ background: "var(--color-bg)" }}
        />
      </div>
    );
  }

  const order = data?.data ?? data;
  if (!order) notFound();

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.Processing;
  const totalItems = order?.order_items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/orders"
          className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <ArrowLeft size={14} /> Orders
        </Link>
        <span style={{ color: "var(--color-border-md)" }}>/</span>
        <span
          className="text-[13px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          #{order.id}
        </span>
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="text-[22px] font-semibold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Order #
              {String(order.id || "")
                .slice(0, 4)
                .toUpperCase()}
            </h1>
            <Badge variant={cfg.variant}>{order.status}</Badge>
          </div>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Placed{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {" · "}
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Printer size={14} /> Print
          </Button>
          {order.status !== "Cancelled" &&
            order.status !== "Delivered" &&
            order.status !== "Refunded" && (
              <Button variant="primary">
                <Package size={14} /> Mark as shipped
              </Button>
            )}
          {order.status === "Delivered" && (
            <Button variant="secondary">
              <RotateCcw size={14} /> Issue refund
            </Button>
          )}
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Items */}
          <Card noPadding>
            <div
              className="px-5 py-3.5 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p
                className="text-[14px] font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Items ({totalItems})
              </p>
            </div>
            <div
              className="divide-y"
              style={{ borderColor: "var(--color-border)" }}
            >
              {order?.order_items.map((item, i) => (
                <div
                  key={item.id + i}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "var(--color-bg)" }}
                  >
                    {item.products.thumbnail_url ? (
                      <img
                        src={item.products.thumbnail_url}
                        alt={item.products.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                    {/* {item.products.thumbnail_url} */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14px] font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.products.name}
                    </p>
                    <p
                      className="text-[12px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {item.variant}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      K{(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      K{item.subtotal.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div
              className="px-5 py-4 space-y-2 border-t"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
              }}
            >
              {[
                { label: "Subtotal", value: `K${order.subtotal.toFixed(2)}` },
                {
                  label: "Shipping",
                  value: order?.shipping === 0 ? "Free" : `K50`,
                },
                { label: "Tax", value: `K${order?.tax?.toFixed(2) || 0.0}` },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between text-[13px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <span>{r.label}</span>
                  <span>{r.value}</span>
                </div>
              ))}
              <div
                className="flex justify-between text-[15px] font-semibold pt-2 border-t"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                <span>Total</span>
                <span>K{order?.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <Section title="Order timeline">
              <div className="mt-1">
                {order?.history.map((step, i) => {
                  const isLast = i === order?.history.length - 1;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                          style={{
                            background: step.created_at
                              ? "var(--color-accent)"
                              : "white",
                            borderColor: step.created_at
                              ? "var(--color-accent)"
                              : "var(--color-border-md)",
                          }}
                        >
                          {step.created_at ? (
                            <Check size={12} color="white" strokeWidth={3} />
                          ) : (
                            <Clock
                              size={11}
                              style={{ color: "var(--color-text-tertiary)" }}
                            />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className="w-px my-1.5"
                            style={{
                              flex: 1,
                              minHeight: 24,
                              background: step.id
                                ? "var(--color-accent)"
                                : "var(--color-border)",
                              opacity: step.id ? 0.25 : 1,
                            }}
                          />
                        )}
                      </div>
                      <div className="pb-5 flex-1">
                        <p
                          className="text-[14px] font-medium"
                          style={{
                            color: step.id
                              ? "var(--color-text-primary)"
                              : "var(--color-text-tertiary)",
                          }}
                        >
                          {step.status}
                        </p>
                        <p
                          className="text-[12px]"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {new Date(step.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                          {/* {step.created_at} */}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <Section title="Notes">
                <p
                  className="text-[13px] mt-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {order.notes}
                </p>
              </Section>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Customer */}
          <Card>
            <Section title="Customer">
              <div className="flex items-center gap-3 mt-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
                  style={{
                    background: order.customer.avatarBg,
                    color: order.customer.avatarColor,
                  }}
                >
                  <Avatar customer={order.customer} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-semibold truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {order.customer.full_name}
                  </p>
                  <p
                    className="text-[12px] truncate"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {order.customer.email}
                  </p>
                  <p
                    className="text-[12px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {order.customer.phone}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full mt-3">
                <MessageSquare size={13} /> Send message
              </Button>
            </Section>
          </Card>

          {/* Shipping */}
          <Card>
            {order.shipping_info.city ? (
              <Section title="Shipping address">
                <div className="flex items-start gap-2.5 mt-1">
                  <MapPin
                    size={14}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                  <div>
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {order.shipping_info.line1}
                    </p>
                    <p
                      className="text-[12px]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {order.shipping_info.city}, {order.shipping_info.state}{" "}
                      {order.shipping_info.zip}
                    </p>
                    <p
                      className="text-[12px]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {order.shipping_info.country}
                    </p>
                  </div>
                </div>
              </Section>
            ) : (
              <Section title="Contact Info">
                <div className="flex items-start gap-2.5 mt-1">
                  <Phone
                    size={14}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                  <div>
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {order.shipping_info.phone}
                    </p>
                    <p
                      className="text-[14px]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {order.shipping_info.name}
                    </p>
                  </div>
                </div>
              </Section>
            )}
          </Card>

          {/* Payment */}
          {/* <Card>
            <Section title="Payment">
              <div className="flex items-center gap-2.5 mt-1">
                <CreditCard
                  size={14}
                  style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                  className="text-[13px] font-medium flex-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {order.paymentMethod}
                </span>
                <Badge
                  variant={
                    order.paymentStatus === "Paid" ? "success" : "warning"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </Section>
          </Card> */}

          {/* Danger zone */}
          {order.status !== "Cancelled" && (
            <Card>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Actions
              </p>
              <Button variant="danger" className="w-full">
                Cancel order
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
