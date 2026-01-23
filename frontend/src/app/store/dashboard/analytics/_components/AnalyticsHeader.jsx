export function AnalyticsHeader() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Store Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store performance
        </p>
      </div>
    </div>
  );
}
