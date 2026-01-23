export function RevenueCard({ title, amount }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold mt-2">ZMW {amount}</p>
    </div>
  );
}
