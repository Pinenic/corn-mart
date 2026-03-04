const STATUS_MAP = {
  in: "bg-green-700 text-green-100 p-1 rounded text-xs w-fit",
  low: "bg-yellow-700 text-yellow-100 p-1 rounded text-xs w-fit",
  out: "bg-red-700 text-red-100 p-1 rounded text-xs w-fit",
};

export default function StockTag({status}) {
  return (
    <div
      className={
        status === "in"
          ? STATUS_MAP.in
          : status === "low"
          ? STATUS_MAP.low
          : STATUS_MAP.out
      }
    >
        {status == "in" ? "In stock" : status == "low" ? "Low stock" : "Out of stock"}
    </div>
  );
}
