// app/product/[slugAndId]/page.jsx
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductControls from "./_components/ProductControls";
import { getProductById } from "@/lib/marketplaceApi";
import { parseSlugAndId } from "./_utils/parseSlugAndId";
import { ProductImages } from "./_components/ProductImages";

export async function generateMetadata(props) {
  const params = await props.params; 
  const { id } = parseSlugAndId(params.slugAndId);
  const res = await getProductById(id);
  const product = res?.data?.[0];

  if (!product) {
    return { title: "Product Not Found | Pine Stores" };
  }

  return {
    title: `${product.name} | Pine Stores`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.product_images?.length
        ? [{ url: product.product_images[0].url }]
        : [],
    },
    alternates: {
      canonical: `https://yourdomain.com/product/${params.slugAndId}`,
    },
  };
}

export default async function Page(props) {
  const params = await props.params; 
  console.log(params.slugAndId);
  const { id, slug } = parseSlugAndId(params.slugAndId);
  console.log(id)
  if (!id) return notFound();

  const res = await getProductById(id);
  const product = res?.data?.[0];

  if (!product) return notFound();

  // make sure URL slug matches product slug
  // if (slug !== product.slug) return notFound();

  const hero = product.product_images?.[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* LEFT: HERO IMAGE */}
        <div className="space-y-4">
            <ProductImages images={product?.product_images}/>
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-3xl font-bold mt-2">ZMW {product.price.toFixed(2)}</p>

          <hr className="my-6" />

          <p className="text-gray-700">{product.description}</p>

          <hr className="my-6" />

          {/* Client component for variant + quantity + cart */}
          <ProductControls product={product} />
        </div>
      </div>

      {/* SEO: JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: product.product_images?.map(i => i.url),
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
