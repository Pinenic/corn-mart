"use client";
import { SiteHeader } from "@/components/site-header";
import { useStoreStore } from "@/store/useStore";
import { AnalyticsHeader } from "./_components/AnalyticsHeader";
import { DateRangeSelector } from "./_components/DateRangeSelector";
import { KpiGrid } from "./_components/KpiGrid";
import { KpiCard } from "./_components/KpiCard";
import { OrderStatusChart } from "./_components/OrderStatusChart";
import { CompletionRateCard } from "./_components/CompletionRateCard";
import { RevenueTrendChart } from "./_components/RevenueTrendChart";
import { TopProducts } from "./_components/TopProducts";
import getStoreAnalytics from "@/lib/storesApi";
import { useEffect, useState } from "react";
import AnalyticsAdapter, { useAnalyticsAdapter } from "@/lib/AnalyticsAdapter";
import {
  PopularProductsBarChart,
  RevenueComparisonChart,
} from "./_components/RevenueAndProductsCharts";
import LoadingOverlay from "@/components/loading-overlay";

const setPageTitle = () => {
  document.title = "Store Analytics | Corn Mart";
};

function getDateRange(range) {
  const end = new Date(); // Date.now()
  let start = new Date(end);

  switch (range) {
    case "24h":
      start.setHours(end.getHours() - 24);
      break;

    case "7d":
      start.setDate(end.getDate() - 7);
      break;

    case "30d":
      start.setDate(end.getDate() - 30);
      break;

    case "3m":
      start.setDate(end.getDate() - 90);
      break;

    default:
      throw new Error("Invalid range");
  }

  return {
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  };
}

function mapOrdersToPieData(orders) {
  return [
    { status: "Pending", value: orders.pending },
    { status: "Completed", value: orders.completed },
    { status: "Cancelled", value: orders.cancelled },
    { status: "Processing", value: (orders.total -(orders.cancelled + orders.pending + orders.completed)) },
  ].filter((item) => item.value > 0);
}

export default function Page() {
  const { store } = useStoreStore();
  const storeId = store?.id;
  const [range, setRange] = useState("24h");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [PieData, setPieData] = useState(null);

  const fetchAnalytics = async (start, end) => {
    try {
      setLoading(true);
      const res = await getStoreAnalytics(storeId, start, end);
      console.log(res);
      
      // The response structure is { success: true, data: {...analytics...} }
      const analyticsData = res.data || res;
      
      setData(analyticsData);
      setPieData(mapOrdersToPieData(analyticsData?.orders || {}));
      console.log(res);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageTitle();
    const { start_date, end_date } = getDateRange(range);

    fetchAnalytics(start_date, end_date);
  }, [range]);
  const { popularProductsChart, revenueComparison } = useAnalyticsAdapter(data);
  // while (loading) {
  //   <LoadingOverlay show={loading}/>
  // }
  return (
    <div className="space-y-6">
      <LoadingOverlay show={loading}/>
      <SiteHeader title={"Analytics"} storeId={storeId} />
      <AnalyticsHeader />
      <DateRangeSelector value={range} onChange={setRange} />

      <KpiGrid>
        <KpiCard title="Total Orders" value={data?.orders?.total || 0} />
        <KpiCard
          title="Completion Rate"
          value={((data?.orders?.completion_rate || 0) * 100).toFixed(1) + "%"}
        />
        <KpiCard title="Customers" value={data?.customers?.total || 0} />
        <KpiCard title="Revenue" value={data?.revenue?.total || 0} />
      </KpiGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <OrderStatusChart data={PieData || []} loading={loading} />
        <CompletionRateCard rate={data?.orders?.completion_rate || 0} />
        <RevenueComparisonChart data={revenueComparison} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PopularProductsBarChart data={popularProductsChart || []} />
        {/* <RevenueTrendChart data={revenueComparison}/> */}
        <TopProducts products={data?.popular_products || []} />
      </div>
    </div>
  );
}
