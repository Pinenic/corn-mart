export function CompletionRateCard({ rate }) {
  return (
    <div className="rounded-xl border p-4 flex flex-col justify-center items-center">
      <p className="text-sm text-muted-foreground">Order Completion Rate</p>
      <p className="text-3xl font-bold mt-2">{(rate * 100).toFixed(1)}%</p>
      <p className="text-xs text-muted-foreground mt-1">
        Completed orders vs total
      </p>
    </div>
  );
}