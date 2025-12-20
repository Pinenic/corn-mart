export function CategoryTabs({ categories, active, onChange }) {
  // const categories = [
  //   "all",
  //   "electronics",
  //   "fashion",
  //   "home",
  //   "beauty",
  //   "sports",
  // ];

  return (
    <div className="flex gap-4 overflow-x-scroll border-b bg-background sticky top-[54px] z-40 px-4 py-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`capitalize px-3 py-1 rounded-full text-sm font-medium transition ${
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
