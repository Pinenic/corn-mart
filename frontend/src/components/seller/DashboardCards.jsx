export function DashboardCards() {
  const cards = [
    { label: "Total Sales", value: "K12,340" },
    { label: "Orders", value: "87" },
    { label: "Products", value: "42" },
    { label: "Visitors", value: "1.2K" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
        >
          <p className="text-gray-500 text-sm">{c.label}</p>
          <p className="text-xl font-semibold text-blue-600">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
