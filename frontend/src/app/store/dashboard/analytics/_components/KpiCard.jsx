export function KpiCard({ title, value, subText, icon }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {subText && (
          <p className="text-xs text-muted-foreground mt-1">{subText}</p>
        )}
      </div>
    </div>
  );
}