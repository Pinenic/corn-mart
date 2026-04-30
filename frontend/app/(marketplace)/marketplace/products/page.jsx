import { ProductsTab } from "../ProductsTab";

export const metadata = {
  title: "Products — Corn Mart Marketplace",
  description: "Browse and search products from independent stores",
};

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">Products</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">Browse products from independent sellers</p>
      </div>
      <ProductsTab />
    </div>
  );
}
