import Image from "next/image";
import { notFound } from "next/navigation";
import ProductControls from "./_components/ProductControls";
import { getProductById } from "@/lib/marketplaceApi";
import { parseSlugAndId } from "./_utils/parseSlugAndId";
import { ProductImages } from "./_components/ProductImages";
import ProductClientWrapper from "./ProductClientWrapper";

export async function generateMetadata(props) {
  const params = await props.params;
  const { id } = parseSlugAndId(params.slugAndId);
  const res = await getProductById(id);
  const product = res?.data?.[0];

  if (!product) {
    return { title: "Product Not Found | Corn Mart" };
  }

  return {
    title: `${product.name} | Corn Mart`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.product_images?.length
        ? [{ url: product.product_images[0].url }]
        : [],
    },
    // alternates: {
    //   canonical: `https://yourdomain.com/product/${params.slugAndId}`,
    // },
  };
}

export default async function Page(props) {
  const params = await props.params;
  console.log(params.slugAndId);
  const { id, slug } = parseSlugAndId(params.slugAndId);
  console.log(id);
  if (!id) return notFound();

  const res = await getProductById(id);
  const product = res?.data?.[0];

  if (!product) return notFound();

  const hero = product.product_images?.[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
       
        <div className="space-y-4">
          <ProductImages images={product?.product_images} />
        </div>

        
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>

          <ProductControls product={product} />
        </div>
      </div> */}
      <ProductClientWrapper product={product} />

      {/* SEO: JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: product.product_images?.map((i) => i.url),
            description: product.description,
            sku: product.id,
            offers: {
              "@type": "Offer",
              priceCurrency: "ZMW",
              price: product.price,
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
    </div>
  );
}
