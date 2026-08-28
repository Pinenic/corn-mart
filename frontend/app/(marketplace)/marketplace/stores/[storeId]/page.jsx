import { Suspense } from "react";
import { apiClient } from "@/lib/api/client";
import { StoreDetailClient } from "./StoreDetailClient";
import { Skeleton } from "@/components/ui";

async function fetchStoreForMetadata(storeId) {
  try {
    const result = await apiClient.get(`/marketplace/stores/${storeId}`);
    return result?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { storeId } = await params;
  const store = await fetchStoreForMetadata(storeId);

  if (!store) {
    return { title: "Store — Corn Mart Marketplace" };
  }

  const title = `${store.name} — Corn Mart Marketplace`;
  const description = store.description
    ? store.description.slice(0, 160)
    : `Shop products from ${store.name} on Corn Mart Marketplace.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: store.banner ? [{ url: store.banner }] : store.logo ? [{ url: store.logo }] : undefined,
    },
  };
}

export default async function StoreProfilePage({ params }) {
  const { storeId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <StoreDetailClient storeId={storeId} />
    </Suspense>
  );
}