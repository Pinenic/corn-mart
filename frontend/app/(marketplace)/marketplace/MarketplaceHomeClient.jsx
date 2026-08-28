"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Grid, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductsTab } from "./ProductsTab";
import { StoresTab } from "./StoresTab";

const TABS = [
  { key: "products", label: "Products", Icon: Grid },
  { key: "stores", label: "Stores", Icon: Store },
];

function MarketplaceTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Derived directly from the URL — no local state — so browser
  // back/forward correctly reflects which tab is active.
  const tab = searchParams.get("tab") === "stores" ? "stores" : "products";

  const switchTab = (t) => {
    // A tab switch is a fresh context: Products and Stores both use
    // param names like `sort`/`page`/`q` for different things, so
    // carrying one tab's filters into the other produced nonsense
    // (e.g. a product price-sort value being read as a store sort).
    // Reset to just ?tab= rather than merging. Uses push (not replace,
    // unlike in-tab filter changes) so switching tabs is a real,
    // back-button-navigable step.
    router.push(`/marketplace?tab=${t}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-[var(--color-border)] w-fit mb-6">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all",
              tab === key
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {tab === "products" ? <ProductsTab /> : <StoresTab />}
    </div>
  );
}

export function MarketplaceHomeClient() {
  return (
    <Suspense>
      <MarketplaceTabs />
    </Suspense>
  );
}