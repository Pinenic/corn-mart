import { useMemo } from "react";

export function useAnalyticsAdapter(data) {
  const customerDistribution = useMemo(() => {
    if (!data?.customers) return [];

    return [
      { label: "New", value: data.customers.new },
      { label: "Returning", value: data.customers.returning },
    ].filter((d) => d.value > 0);
  }, [data?.customers]);

  const revenueComparison = useMemo(() => {
    if (!data?.revenue) return [];

    return [
      { label: "Potential", value: data.revenue.potential, color: "#f9cb16" },
      { label: "Realized", value: data.revenue.total, color: "#22c55e" },
      { label: "Lost", value: data.revenue.lost, color: "#f91616" },
    ];
  }, [data?.revenue]);

  const popularProductsChart = useMemo(() => {
    if (!data?.popular_products) return [];

    return data.popular_products.map((p) => ({
      name: p.product_name,
      units: p.units_sold,
    }));
  }, [data?.popular_products]);

  const popularVariantsChart = useMemo(() => {
    if (!data?.popular_variants) return [];

    return data.popular_variants.map((v) => ({
      id: v.variant_id,
      units: v.units_sold,
    }));
  }, [data?.popular_variants]);

  return {
    customerDistribution,
    revenueComparison,
    popularProductsChart,
    popularVariantsChart,
  };
}
