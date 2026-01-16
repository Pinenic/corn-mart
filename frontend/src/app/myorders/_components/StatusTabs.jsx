export function StatusTabs({ categories, active, onChange }) {
  // const categories = [
  //   "all",
  //   "electronics",
  //   "fashion",
  //   "home",
  //   "beauty",
  //   "sports",
  // ];

  return (
    <div className="flex h-fit gap-2 overflow-x-scroll border-b bg-card px-4 py-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`capitalize px-3 py-0 rounded-full text-sm font-medium transition ${
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
