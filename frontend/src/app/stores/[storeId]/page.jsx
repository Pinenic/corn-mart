import StoreClient from "./StoreClient";
import { getStoreById } from "@/lib/storesApi";

export async function generateMetadata({ params }) {
  const store = await getStoreById(params.storeId);

  return {
    title: `${store.name} | Corn Mart`,
    description: store.description,
    openGraph: {
      title: store.name,
      description: store.description,
      url: `https://corn-mart.vercel.app/stores/${store.id}`,
      images: [
        {
          url: store.logo,
          width: 1200,
          height: 630
        }
      ],
      type: "website"
    }
  };
}

export default async function StorePage({ params }) {
  const store = await getStoreById(params.storeId);

  return <StoreClient initialStore={store} />;
}
