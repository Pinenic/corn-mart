export function CategoryTabs({ categories, active, onChange }) {


  return (
    <div className="flex gap-4 max-w-7xl overflow-x-auto border-b bg-background px-4 py-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`capitalize border px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap ${
            active === cat
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
