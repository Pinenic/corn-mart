import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// =============================
// 1. Revenue Comparison Bar Chart
// =============================

export function RevenueComparisonChart({ data }) {
  // expected data shape:
  // [
  //   { label: "Realized", value: number },
  //   { label: "Potential", value: number }
  // ]

  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-4">Revenue Comparison</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => [`ZMW ${v}`, "Revenue"]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Realized vs potential revenue for selected period
      </p>
    </div>
  );
}

// =============================
// 2. Popular Products Horizontal Bar Chart
// =============================

export function PopularProductsBarChart({ data }) {
  // expected data shape:
  // [
  //   { name: "Product name", units: number }
  // ]

  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-4">Top Selling Products</h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={50} className="text-xs md:text-sm"/>
            <Tooltip formatter={(v) => [`${v} units`, "Sold"]} />
            <Bar dataKey="units" radius={[0, 6, 6, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Ranked by total units sold
      </p>
    </div>
  );
}
