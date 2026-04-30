import { StoresTab } from "../StoresTab";

export const metadata = {
  title: "Stores — Corn Mart Marketplace",
  description: "Discover independent stores and sellers",
};

export default function StoresPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">Stores</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">Discover independent sellers on Corn Mart</p>
      </div>
      <StoresTab />
    </div>
  );
}
