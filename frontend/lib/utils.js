import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function formatPrice(n) {
  return `K${Number(n).toFixed(2)}`;
}
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
export function truncate(str, n) {
  return str?.length > n ? str.slice(0, n) + "…" : str;
}
