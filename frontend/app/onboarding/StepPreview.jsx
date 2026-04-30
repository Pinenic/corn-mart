"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Users, Heart, Share2, Package, Star, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Animated fake product card for the preview
function FakeProductCard({ delay = 0, name, price, emoji }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden transition-all duration-500",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
    )}>
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl">
        {emoji}
      </div>
      <div className="p-2.5">
        <p className="text-[12px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{name}</p>
        <p className="text-[13px] font-bold mt-0.5" style={{ color: "var(--color-accent)" }}>{price}</p>
      </div>
    </div>
  );
}

const FAKE_PRODUCTS = [
  { name: "Your first product",  price: "K99.00",  emoji: "📦", delay: 300  },
  { name: "Coming soon...",       price: "—",       emoji: "✨", delay: 450  },
  { name: "Add more products",    price: "—",       emoji: "🛍️", delay: 600  },
  { name: "Customers are waiting",price: "—",       emoji: "🎯", delay: 750  },
];

export function StepPreview({ store }) {
  const [following,  setFollowing]  = useState(false);
  const [followers,  setFollowers]  = useState(store?.followers_count ?? 0);
  const [headerVisible, setHeader]  = useState(false);
  const [badgeVisible,  setBadge]   = useState(false);
  const [statsVisible,  setStats]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeader(true),  100);
    const t2 = setTimeout(() => setBadge(true),   400);
    const t3 = setTimeout(() => setStats(true),   600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const bannerUrl = store?.banner;
  const logoUrl   = store?.logo;
  const accentColor = "#0057ff";
  const initials  = (store?.name ?? "S")[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Celebration banner */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-700",
        headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )} style={{ background: "var(--color-accent-subtle)", borderColor: "var(--color-accent)" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--color-accent)" }}>
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-bold" style={{ color: "var(--color-accent-text)" }}>
            Your store is live!
          </p>
          <p className="text-[12px]" style={{ color: "var(--color-accent-text)", opacity: 0.8 }}>
            Here's how buyers will see your storefront
          </p>
        </div>
      </div>

      {/* Storefront card */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-lg">

        {/* Banner */}
        <div className="h-32 md:h-44 relative overflow-hidden"
          style={{ background: bannerUrl ? undefined : `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}06 100%)` }}>
          {bannerUrl
            ? <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
            : (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: accentColor }} />
                <div className="absolute -bottom-20 -left-10 w-36 h-36 rounded-full opacity-5" style={{ background: accentColor }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                  <Package size={80} style={{ color: accentColor }} />
                </div>
              </div>
            )
          }
        </div>

        {/* Profile section */}
        <div className="px-4 md:px-6 pb-5">
          <div className="flex items-end justify-between gap-3 -mt-7 mb-3 flex-wrap">

            {/* Logo */}
            <div className={cn(
              "w-14 h-14 md:w-16 md:h-16 rounded-2xl border-4 border-white shadow-md overflow-hidden flex-shrink-0 transition-all duration-500",
              headerVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )} style={{ background: accentColor }}>
              {logoUrl
                ? <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                    {initials}
                  </div>
              }
            </div>

            {/* Action buttons */}
            <div className={cn(
              "flex items-center gap-2 mb-1 transition-all duration-500 delay-200",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
              <button
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors hover:bg-[var(--color-bg)]"
                style={{ borderColor: "var(--color-border-md)" }}>
                <Share2 size={15} style={{ color: "var(--color-text-secondary)" }} />
              </button>
              <button
                onClick={() => { setFollowing(f => !f); setFollowers(n => following ? n - 1 : n + 1); }}
                className={cn(
                  "flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold transition-all",
                  following
                    ? "border border-[var(--color-border-md)] text-[var(--color-text-secondary)] bg-white"
                    : "text-white"
                )}
                style={{ background: following ? undefined : accentColor }}>
                <Heart size={13} fill={following ? "currentColor" : "none"} />
                {following ? "Following" : "Follow"}
              </button>
            </div>
          </div>

          {/* Name + verified */}
          <div className={cn(
            "mb-1 transition-all duration-500 delay-100",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[18px] md:text-[20px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                {store?.name}
              </h2>
              <div className={cn(
                "flex items-center gap-1 transition-all duration-500",
                badgeVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
              )} style={{ color: accentColor }}>
                <ShieldCheck size={16} />
                <span className="text-[11px] font-semibold">Verified</span>
              </div>
            </div>
          </div>

          {store?.description && (
            <p className={cn(
              "text-[13px] leading-relaxed mb-3 max-w-lg transition-all duration-500 delay-150",
              headerVisible ? "opacity-100" : "opacity-0"
            )} style={{ color: "var(--color-text-secondary)" }}>
              {store.description}
            </p>
          )}

          {/* Stats row */}
          <div className={cn(
            "flex items-center gap-4 text-[12px] transition-all duration-500",
            statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )} style={{ color: "var(--color-text-secondary)" }}>
            <div className="flex items-center gap-1.5">
              <Users size={13} style={{ color: accentColor }} />
              <span><strong className="text-[var(--color-text-primary)]">{followers}</strong> followers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={13} className="fill-yellow-400 text-yellow-400" />
              <span>New store</span>
            </div>
          </div>

          {/* Products heading */}
          <div className="mt-5 mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Products</p>
            <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Coming soon</span>
          </div>

          {/* Fake product grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FAKE_PRODUCTS.map((p, i) => (
              <FakeProductCard key={i} {...p} />
            ))}
          </div>

          {/* Teaser note */}
          <div className="mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed"
            style={{ borderColor: "var(--color-border-md)" }}>
            <ArrowRight size={13} style={{ color: "var(--color-accent)" }} />
            <p className="text-[12px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Add your first real product in the next step
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
