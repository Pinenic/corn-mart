export function CategoryTabs({ active, onChange }) {
  const categories = ["all", "electronics", "fashion", "home", "beauty", "sports"];

  return (
    <div className="flex gap-4 overflow-x-auto border-b bg-white sticky top-[54px] z-40 px-4 py-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`capitalize px-3 py-1 rounded-full text-sm font-medium transition ${
            active === cat
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
