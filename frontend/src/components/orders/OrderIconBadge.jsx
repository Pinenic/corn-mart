import {
  Clock,
  Loader2,
  Truck,
  PackageCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const orderStatusConfig = {
  pending: {
    icon: Clock,
    iconColor: "text-yellow-600",
    badgeBg: "bg-yellow-100",
  },
  processing: {
    icon: Loader2,
    iconColor: "text-blue-600",
    badgeBg: "bg-blue-100",
  },
  shipped: {
    icon: Truck,
    iconColor: "text-indigo-600",
    badgeBg: "bg-indigo-100",
  },
  delivered: {
    icon: PackageCheck,
    iconColor: "text-green-600",
    badgeBg: "bg-green-100",
  },
  confirmed: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-100",
  },
  completed: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-100",
  },
  cancelled: {
    icon: XCircle,
    iconColor: "text-red-600",
    badgeBg: "bg-red-100",
  },
};


export default function OrderIconBadge({ status }) {
  const config = orderStatusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 h-3 rounded-full text-sm font-medium ${config.iconColor}`}
    >
      <Icon className="w-3 h-3" />
      {/*<span className="capitalize">{status}</span>*/}
    </span>
  );
}
