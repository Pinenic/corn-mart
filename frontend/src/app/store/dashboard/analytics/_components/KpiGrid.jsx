export function KpiGrid({ children }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}