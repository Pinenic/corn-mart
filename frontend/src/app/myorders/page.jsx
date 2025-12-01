import OrdersClient from "./OrdersClient";
import { getBuyerOrder, getStoreOrderDetails } from "@/lib/ordersApi";
import data from './data.json';

export default async function Page({ params }) {
  const id = params?.id;
  let initialOrder = {};

  try {
    initialOrder = await getBuyerOrder(profile?.id);
  } catch (err) {
    // server-side fetch failed; client will handle retries
    console.error("Failed to fetch order on server:", err?.message || err);
  }

  return (
    <div>
      {/* OrdersClient is a client component that manages interactivity and updates */}
      <OrdersClient initialOrder={data} soId={id} />
    </div>
  );
}
