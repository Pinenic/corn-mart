"use client";
// components/auth/AuthBrandPanel.jsx
// Animated brand panel shown on the left side of auth pages (desktop only).
// Features a gradient background, floating metric cards, and a subtle
// animated mesh to keep the panel alive without hurting performance.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, TrendingUp, Users, Package, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { icon: TrendingUp, label: "Avg. revenue growth",  value: "2.4×",  color: "#0057ff", delay: 0    },
  { icon: Users,      label: "Active buyers",         value: "12,500",color: "#7c3aed", delay: 150  },
  { icon: Package,    label: "Products listed",       value: "48K+",  color: "#059669", delay: 300  },
  { icon: Star,       label: "Seller satisfaction",   value: "4.9★",  color: "#d97706", delay: 450  },
];

function FloatingCard({ icon: Icon, label, value, color, delay, visible }) {
  return (
    <div className={cn(
      "bg-white/90 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg border border-white/20 transition-all duration-700",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )} style={{ transitionDelay: `${delay + 400}ms` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + "20" }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className="text-[15px] font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function AuthBrandPanel() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="hidden lg:flex relative w-[480px] xl:w-[520px] flex-shrink-0 overflow-hidden"
      style={{ background: "linear-gradient(145deg, #16a34a 0%, #3e9f61 40%, #39a460 70%, #16a34a 100%)" }}>

      {/* Animated mesh background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large soft blobs */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #16a34a, transparent)", animation: "drift1 8s ease-in-out infinite" }} />
        <div className="absolute top-1/2 -right-20 w-60 h-60 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)", animation: "drift2 10s ease-in-out infinite" }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #34d399, transparent)", animation: "drift1 12s ease-in-out infinite reverse" }} />

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between w-full px-10 py-12">

        {/* Logo + back link */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <span className="text-[20px] font-bold text-white">Corn Mart</span>
          </Link>
          <Link href="/" className="text-[12px] font-medium text-white/60 hover:text-white transition-colors">
            ← Back to site
          </Link>
        </div>

        {/* Main copy */}
        <div className={cn(
          "transition-all duration-700",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}>
          <p className="text-[13px] font-semibold text-blue-200 uppercase tracking-widest mb-3">
            For independent sellers
          </p>
          <h2 className="text-[36px] xl:text-[40px] font-bold text-white leading-tight mb-4">
            Your store,<br />your success
          </h2>
          <p className="text-[15px] text-blue-100 leading-relaxed max-w-sm">
            Join thousands of sellers who use Corn Mart to reach buyers across Zambia and beyond.
          </p>
        </div>

        {/* Stat cards */}
        {/* <div className="space-y-3">
          {STATS.map((s) => (
            <FloatingCard key={s.label} {...s} visible={visible} />
          ))}
        </div> */}

        {/* Testimonial */}
        {/* <div className={cn(
          "bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 transition-all duration-700 delay-700",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <p className="text-[13px] text-white/90 leading-relaxed mb-3">
            "Setting up my store took 10 minutes. Within a week I had my first sale."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-[11px] font-bold text-blue-900">
              AC
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white">Ama Chileshe</p>
              <p className="text-[10px] text-blue-200">Handmade Crafts · Lusaka</p>
            </div>
          </div>
        </div> */}
      </div>

      <style jsx>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.05); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
