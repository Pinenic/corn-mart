"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider"; // shadcn slider

export default function FilterSidebar({ filters, onChange }) {
  const [expanded, setExpanded] = useState({
    category: true,
    price: true,
    rating: true,
  });

  const toggle = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInput = (filterType, value) => {
    onChange((prev) => ({ ...prev, [filterType]: value }));
  };

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border border-gray-200 rounded-xl shadow-sm p-4 space-y-6">
      {/* Category Filter */}
      <div>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggle("category")}
        >
          <h3 className="font-semibold text-gray-800 text-sm">Category</h3>
          {expanded.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {expanded.category && (
          <div className="mt-2 space-y-2">
            {["Cakes", "Bakery", "Drinks", "Snacks", "Fruits"].map((cat) => (
              <label key={cat} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  value={cat}
                  checked={filters.category?.includes(cat) || false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newCats = checked
                      ? [...(filters.category || []), cat]
                      : filters.category.filter((c) => c !== cat);
                    handleInput("category", newCats);
                  }}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggle("price")}
        >
          <h3 className="font-semibold text-gray-800 text-sm">Price Range</h3>
          {expanded.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {expanded.price && (
          <div className="mt-3">
            <Slider
              defaultValue={[filters.price.min, filters.price.max]}
              min={0}
              max={500}
              step={5}
              onValueChange={(value) =>
                handleInput("price", { min: value[0], max: value[1] })
              }
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${filters.price.min}</span>
              <span>${filters.price.max}</span>
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggle("rating")}
        >
          <h3 className="font-semibold text-gray-800 text-sm">Rating</h3>
          {expanded.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {expanded.rating && (
          <div className="mt-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <label key={stars} className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="rating"
                  value={stars}
                  checked={filters.rating === stars}
                  onChange={() => handleInput("rating", stars)}
                />
                <span>{"★".repeat(stars)} & up</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
