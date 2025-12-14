"use client";
export function TopbarMobile() {
  return (
    <header className="sticky top-0 bg-white border-b p-3 flex items-center justify-between shadow-sm z-20">
      <h2 className="font-bold text-blue-600 text-lg">My Store</h2>
      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg active:scale-95 transition">
        Add Item
      </button>
    </header>
  );
}
