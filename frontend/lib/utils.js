import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Merges a patch of {key: value} into an existing URLSearchParams
 * (or search-params-like object), returning a new query string.
 * - Keys with a falsy/empty value (except the number 0) are deleted,
 *   so the URL doesn't accumulate "?category=&min=" clutter.
 * - Any key not mentioned in `patch` is left untouched — this is what
 *   lets a filter change on /marketplace?tab=products preserve `tab`
 *   instead of wiping it out.
 */
export function buildParams(current, patch) {
  const params = new URLSearchParams(current?.toString?.() ?? current ?? "");
  for (const [key, value] of Object.entries(patch)) {
    if (value === "" || value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  return params.toString();
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