import { apiClient } from "@/lib/api/client";
import { ProductDetailClient } from "./ProductDetailClient";

async function fetchProductForMetadata(productId) {
  try {
    const result = await apiClient.get(`/marketplace/products/${productId}`);
    return result?.data ?? null;
  } catch {
    // Product not found / API error — fall back to a generic title
    // rather than failing the page render.
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { productId } = await params;
  const product = await fetchProductForMetadata(productId);

  if (!product) {
    return { title: "Product — Corn Mart Marketplace" };
  }

  const title = `${product.name} — Corn Mart Marketplace`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.name} on Corn Mart Marketplace.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.thumbnail_url ? [{ url: product.thumbnail_url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { productId } = await params;
  return <ProductDetailClient productId={productId} />;
}