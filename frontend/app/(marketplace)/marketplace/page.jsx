"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Grid, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductsTab } from "./ProductsTab";
import { StoresTab }   from "./StoresTab";

const TABS = [
  { key: "products", label: "Products", Icon: Grid  },
  { key: "stores",   label: "Stores",   Icon: Store },
];

function MarketplaceTabs() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "products");

  const switchTab = (t) => {
    setTab(t);
    const p = new URLSearchParams(searchParams);
    p.set("tab", t);
    router.replace(`/marketplace?${p}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-[var(--color-border)] w-fit mb-6">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => switchTab(key)}
            className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all", tab === key ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]")}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {tab === "products" ? <ProductsTab /> : <StoresTab />}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceTabs />
    </Suspense>
  );
}
