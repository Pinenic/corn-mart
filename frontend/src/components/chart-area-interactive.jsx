"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getStoreOrders } from "@/lib/ordersApi";

export const description = "An interactive area chart";


const chartConfig = {
  visitors: {
    label: "Sales",
  },

  desktop: {
    label: "Orders",
    color: "var(--primary)",
  },

  mobile: {
    label: "Revenue",
    color: "var(--primary)",
  },
};

function generate90DayChartData(orders) {
  console.log(
    "Received orders:",
    orders.filter(o => o.status === "received").length
  );
  
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 89); // last 90 days including today

  // 🧠 Normalize to UTC date (YYYY-MM-DD)
  const toUTCDateString = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // e.g. "2025-10-21"
  };

  // Step 1: Group received orders by UTC date
  const grouped = orders.reduce((acc, order) => {
    if (order.status !== "received") return acc;

    const date = toUTCDateString(order.created_at);
    if (!acc[date]) acc[date] = { date, desktop: 0, mobile: 0 };

    acc[date].desktop += 1;
    acc[date].mobile += Number(order.net_amount) || 0;

    return acc;
  }, {});

  // Step 2: Fill in all dates within the last 90 days
  const chartData = [];
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = toUTCDateString(d);
    chartData.push(grouped[dateStr] || { date: dateStr, desktop: 0, mobile: 0 });
  }
  console.log(chartData);
  return chartData;
}

// ✅ Usage
// const chartData = generate90DayChartData(orders);
// console.log(chartData);

export function ChartAreaInteractive({storeId}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  // const [delloading, setDelLoading] = useState(false);
  // const [message, setMessage] = useState("");
  // const storeId = "9fa980ba-e1d9-4983-89f3-b735a77e7e7a";

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getStoreOrders(storeId);
      setChartData(generate90DayChartData(data));
      setLoading(false);
    } catch (err) {
      console.error(err.message);
    }
  }

  React.useEffect(() => {
    loadOrders();
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile], [storeId]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Sales Statistics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
