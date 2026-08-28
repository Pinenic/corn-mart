import { MarketplaceHomeClient } from "./MarketplaceHomeClient";

export async function generateMetadata({ searchParams }) {
  const { tab } = await searchParams;
  const label = tab === "stores" ? "Stores" : "Products";
  return {
    title: `${label} — Corn Mart Marketplace`,
    description: "Discover and shop from independent stores on Corn Mart.",
  };
}

export default function MarketplacePage() {
  return <MarketplaceHomeClient />;
}