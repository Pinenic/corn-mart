import { AutoBreadcrumb } from "../components/AutoBreadcrumb";
import ProductsClient from "./ProductsClient";
import { getProductsByCategory } from "@/lib/marketplaceApi";

export async function generateMetadata({ params }) {
  const { category } = params || {};
  const decodedCategory = category.charAt(0).toUpperCase() +
          decodeURIComponent(category.slice(1).replace(/-/g, " "));
  return {
    title: `${decodedCategory} | Corn Mart`,
    description: `Browse ${decodedCategory} products on Corn Mart marketplace.`,
  };
}

export default async function Page({ params }) {
  const { category } = params || {};
  let products = [];

  try {
    const res = await getProductsByCategory(decodeURIComponent(category || ""));
    products = res?.data ?? [];
  } catch (error) {
    // Server-side fetch failed — render page and let the client component handle retries
    console.error("Failed to fetch products on server:", error);
  }

  return (
    <div className="flex">
      <main className="w-full">
        <div className="flex justify-between px-3 md:mt-5">
          <AutoBreadcrumb />
          {/* Sorting / view controls moved to client component to avoid client bundle for initial render */}
          <div className="flex gap-4" />
        </div>

        {/* Server provides initial products for faster first paint / SEO. Client component handles interactivity. */}
        <ProductsClient initialProducts={products} category={category} />
      </main>
    </div>
  );
}
