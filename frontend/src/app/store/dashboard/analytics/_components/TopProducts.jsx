export function TopProducts({ products }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-3">Top Products</h3>
      <ul className="space-y-2">
        {products.map((product, index) => (
          <li key={product.id} className="flex justify-between text-sm">
            <span>
              {index + 1}. {product.product_name}
            </span>
            <span className="font-medium">{product.units_sold}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}