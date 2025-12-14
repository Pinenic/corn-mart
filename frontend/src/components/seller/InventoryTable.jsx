"use client";
import { Edit, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";

export default function InventoryTable({ searchTerm }) {
  const [products, setProducts] = useState([
    { id: 1, name: "Blue Hoodie", stock: 32, price: 35, status: "Active" },
    { id: 2, name: "Leather Wallet", stock: 8, price: 50, status: "Low Stock" },
    { id: 3, name: "Running Shoes", stock: 0, price: 60, status: "Out of Stock" },
  ]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 text-gray-700 font-medium">
          <tr>
            <th className="p-4">Product</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Price</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr
              key={product.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="p-4 font-medium text-gray-800">{product.name}</td>
              <td className="p-4">{product.stock}</td>
              <td className="p-4">${product.price}</td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : product.status === "Low Stock"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.status}
                </span>
              </td>
              <td className="p-4 text-right flex justify-end gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 py-6">No products found.</p>
      )}
    </div>
  );
}
