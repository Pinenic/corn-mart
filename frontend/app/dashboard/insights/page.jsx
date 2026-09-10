"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VariantHeatmap } from "@/components/sales/VariantHeatmap";
import { CustomerMetrics } from "@/components/sales/CustomerMetrics";

export default function InsightsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/sales"
          className="text-[12px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] flex items-center gap-1.5 mb-2 w-fit"
        >
          <ArrowLeft size={13} /> Back to Sales
        </Link>
        <h1 className="text-[22px] font-bold text-[var(--color-text-primary)]">Deeper Insights</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
          Variant performance and customer breakdowns
        </p>
      </div>

      <VariantHeatmap />
      <CustomerMetrics />
    </div>
  );
}
