"use client";

import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  Home,
  XCircle,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const STATUS_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    icon: Home,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
  },
};


function formatTimestamp(ts) {
  return new Date(ts).toLocaleString();
}

export default function OrderStatusTimeline({ history }) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const currentStatus = sortedHistory.at(-1)?.status;

  const checkpoints =
    currentStatus === "cancelled"
      ? [...STATUS_FLOW.slice(0, -1), "cancelled"]
      : STATUS_FLOW;

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto">
        <div className="flex md:flex-row flex-col md:items-center gap-6 min-w-max md:min-w-0">
          {checkpoints.map((status, idx) => {
            const { label, icon: Icon } = STATUS_CONFIG[status];

            const state =
              currentStatus === "cancelled"
                ? status === "cancelled"
                  ? "cancelled"
                  : "completed"
                : STATUS_FLOW.indexOf(status) <
                  STATUS_FLOW.indexOf(currentStatus)
                ? "completed"
                : status === currentStatus
                ? "current"
                : "upcoming";

            const historyItem = sortedHistory.find(
              (h) => h.status === status
            );

            return (
              <div
                key={status}
                className="relative flex md:flex-col flex-row items-center gap-3"
              >
                {/* Connector */}
                {idx !== 0 && (
                  <div
                    className={`absolute md:top-4 md:left-[-2.5rem] md:w-10 md:h-px
                      left-4 top-[-2.5rem] h-10 w-px
                      ${
                        state === "completed"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                  />
                )}

                {/* Tooltip Icon */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                        ${
                          state === "completed"
                            ? "bg-green-500 text-white"
                            : state === "current"
                            ? "bg-blue-500 text-white animate-pulse"
                            : state === "cancelled"
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      <Icon size={18} />
                    </div>
                  </TooltipTrigger>

                  <TooltipContent side="top" align="center">
                    <div className="text-center">
                      <p className="font-medium">{label}</p>
                      {historyItem?.created_at ? (
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(historyItem.created_at)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Not reached yet
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
