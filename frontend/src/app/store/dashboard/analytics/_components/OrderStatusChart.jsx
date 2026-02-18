import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const STATUS_COLORS = {
  Pending: "#facc15",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
};

export function OrderStatusChart({ data }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-4">Orders by Status</h3>

      <div className="flex items-center gap-6">
        {/* Chart */}
        <div className="h-56 w-56">
          {data.length == 0 ? <h3 className="text-sm font-medium mb-4 mx-auto text-center mt-10">No orders in this period</h3> : <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="status"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                isAnimationActive
                animationDuration={500}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [`${value} orders`, name]}
              />
            </PieChart>
          </ResponsiveContainer>}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 text-sm">
          {data.map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[item.status] || "#94a3b8",
                  }}
                />
                <span className="text-muted-foreground">
                  {item.status}
                </span>
              </div>

              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
