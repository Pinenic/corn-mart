"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HeroBlock({ block, store }) {
  const image = block.image ?? store?.banner ?? null;
  const href = block.cta?.href ?? `/marketplace/stores/${store?.id}`;
  const dark = block.theme !== "light";
  const bgColor = dark ? "#0a0a0a" : "var(--color-bg)";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] mb-8 group",
        dark ? "bg-[#0a0a0a]" : "bg-[var(--color-bg)]"
      )}
      style={{ "--hero-bg": bgColor }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 items-center min-h-[280px] md:min-h-[360px]">
        {/* Copy — unchanged */}
        <div className="px-6 md:px-12 py-10 md:py-0 order-2 md:order-1 z-10">
          {block.eyebrow && (
            <p className={cn("text-[13px] font-medium mb-2 tracking-wide", dark ? "text-white/50" : "text-[var(--color-text-muted)]")}>
              {block.eyebrow}
            </p>
          )}
          <h1 className={cn("text-[32px] md:text-[44px] font-bold leading-[1.05] mb-3", dark ? "text-white" : "text-[var(--color-text-primary)]")}>
            {block.headline}
          </h1>
          {block.subhead && (
            <p className={cn("text-[14px] mb-6 max-w-sm leading-relaxed", dark ? "text-white/60" : "text-[var(--color-text-secondary)]")}>
              {block.subhead}
            </p>
          )}
          <Link href={href}>
            <button className={cn("h-11 px-6 rounded-[var(--radius-sm)] text-[13px] font-semibold border transition-colors",
              dark ? "border-white/30 text-white hover:bg-white hover:text-[#0a0a0a]"
                   : "border-[var(--color-text-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-white")}>
              {block.cta?.label ?? "Shop Now"}
            </button>
          </Link>
        </div>

        {/* Image */}
        <div className="relative order-1 md:order-2 h-48 md:h-full overflow-hidden">
          {image ? (
            <>
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Blend into --hero-bg: bottom-up on mobile (image sits
                  above the copy), left-to-right on desktop (image sits
                  right of the copy). One gradient per breakpoint, both
                  reading the same variable set on the outer div above —
                  so this can never drift out of sync with dark/light. */}
              <div
                className={cn(
                  "absolute inset-0 pointer-events-none",
                  "bg-[linear-gradient(to_top,var(--hero-bg)_0%,transparent_45%)]",
                  "md:bg-[linear-gradient(to_right,var(--hero-bg)_0%,transparent_45%)]"
                )}
              />
            </>
          ) : (
            <div className={cn("w-full h-full flex items-center justify-center text-6xl", dark ? "opacity-20" : "opacity-30")}>
              🛍️
            </div>
          )}
        </div>
      </div>
    </div>
  );
}