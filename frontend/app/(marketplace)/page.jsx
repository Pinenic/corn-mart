"use client";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { Button, Card, Skeleton } from "@/components/ui";
import { ProductCard }  from "@/components/products/ProductCard";
import { StoreCard }    from "@/components/stores/StoreCard";
import { useMarketplaceProducts } from "@/lib/hooks/useProducts";
import { useMarketplaceStores }   from "@/lib/hooks/useStores";
import { useState } from "react";
import { ProductPreviewModal } from "@/components/products/ProductPreviewModal";

const CATEGORIES = [
  { name: "Footwear",      emoji: "👟" },
  { name: "Electronics",   emoji: "🎧" },
  { name: "Accessories",   emoji: "⌚" },
  { name: "Apparel",       emoji: "👔" },
  { name: "Home & Living", emoji: "🪔" },
  { name: "Bags",          emoji: "👜" },
];

const PERKS = [
  { icon: ShieldCheck,   title: "Verified sellers",   desc: "Every store is reviewed before going live" },
  { icon: MessageCircle, title: "Direct contact",     desc: "Message sellers directly, no middlemen"    },
  { icon: Truck,         title: "Flexible delivery",  desc: "Sellers offer multiple delivery options"   },
  { icon: Sparkles,      title: "Curated products",   desc: "Quality goods from independent creators"  },
];

export default function HomePage() {
  const [previewProduct, setPreview] = useState(null);

  const { products, isLoading: pLoading } = useMarketplaceProducts({ limit: 8, sort: "created_at", order: "desc" });
  const { stores,   isLoading: sLoading } = useMarketplaceStores({ limit: 4 });

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/5" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={13} />
            <span className="text-[12px] font-semibold">Discover independent stores</span>
          </div>
          <h1 className="text-[36px] md:text-[52px] font-bold leading-tight mb-5 tracking-tight">
            Shop from the stores<br />
            <span className="text-blue-200">you love</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-blue-100 max-w-xl mx-auto mb-8 leading-relaxed">
            Browse thousands of products from independent sellers. Find unique items and support local businesses.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/marketplace/products">
              <Button size="lg" className="bg-white text-[var(--color-primary)] hover:bg-blue-50 font-bold shadow-lg">
                Browse products <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/marketplace/stores">
              <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">
                Explore stores
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category strip ── */}
      <section className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.name} href={`/marketplace/products?category=${encodeURIComponent(cat.name)}`}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all duration-200 cursor-pointer flex-shrink-0 group">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-[12px] font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary-text)] whitespace-nowrap">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-bold text-[var(--color-text-primary)]">New arrivals</h2>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Latest products from our sellers</p>
          </div>
          <Link href="/marketplace/products" className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-primary)] hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {pLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)]">
                <Skeleton className="aspect-square" />
                <div className="p-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} onQuickView={setPreview} />)}
          </div>
        )}
      </section>

      {/* ── Perks strip ── */}
      <section className="bg-white border-y border-[var(--color-border)] py-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center">
                <Icon size={22} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--color-text-primary)]">{title}</p>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured stores ── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-bold text-[var(--color-text-primary)]">Popular stores</h2>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Shops people keep coming back to</p>
          </div>
          <Link href="/marketplace/stores" className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-primary)] hover:underline">
            All stores <ArrowRight size={14} />
          </Link>
        </div>

        {sLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stores.map(s => <StoreCard key={s.id} store={s} />)}
          </div>
        )}
      </section>

      {/* ── CTA banner ── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-16">
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-[24px] md:text-[30px] font-bold mb-3">Have a store?</h2>
          <p className="text-blue-100 text-[14px] mb-6 max-w-md mx-auto">List your products, reach thousands of buyers and manage everything from one dashboard.</p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-white text-[var(--color-primary)] hover:bg-blue-50 font-bold shadow-lg">
              Start selling today <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick-view modal */}
      <ProductPreviewModal
        product={previewProduct}
        open={Boolean(previewProduct)}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
