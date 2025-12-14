"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderTrackingStep from "./OrderTrackingStep";

export default function OrderTrackingModal({ open, onClose, order }) {
  if (!order) return null;

  // Example tracking data (later fetched from Supabase)
  const steps = [
    { label: "Order Placed", date: "Oct 7, 2025" },
    { label: "Processing", date: "Oct 8, 2025" },
    { label: "Shipped", date: "Oct 9, 2025" },
    { label: "Out for Delivery", date: null },
    { label: "Delivered", date: null },
  ];

  // Determine current step index
  const currentStepIndex = steps.findIndex((s) => s.label === order.status);
  const isCompleted = (i) => i < currentStepIndex;
  const isActive = (i) => i === currentStepIndex;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Tracking Order #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {steps.map((step, i) => (
            <OrderTrackingStep
              key={i}
              label={step.label}
              date={step.date}
              active={isActive(i)}
              completed={isCompleted(i)}
            />
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-800">
            Estimated delivery: <span className="font-semibold">Oct 12, 2025</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
