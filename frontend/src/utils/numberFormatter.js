export function formatNumber(numb) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2, // Example option to ensure two decimal places
    maximumFractionDigits: 2,
  });
  return formatter.format(numb);
}
