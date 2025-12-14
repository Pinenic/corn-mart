import OrderIconBadge from "./OrderIconBadge";

export default function OrderStatusBadge({ status }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`px-3 py-1 flex gap-2 items-center rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-700"}`}
    >
      <OrderIconBadge status={status}/> {" "}{label}
    </span>
  );
}
