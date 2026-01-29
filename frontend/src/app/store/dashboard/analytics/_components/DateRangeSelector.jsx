const ranges = ["24h", "7d", "30d", "3m"];

export function DateRangeSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`rounded-md px-3 py-1.5 text-sm border transition ${
            value === range
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}