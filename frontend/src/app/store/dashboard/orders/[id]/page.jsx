import { getStoreOrderDetails } from "@/lib/ordersApi";
import OrdersClientWrapper from "../components/OrdersClientWrapper";

/**
 * Server-side page for store order details.
 * Fetches order data on the server and renders a client wrapper that handles
 * interactive updates and in-place refreshes.
 */
export default async function Page(props) {
  const { id } = await props.params;

  // Server-side fetch to hydrate initialOrder
  let order = {};
  try {
    const res = await getStoreOrderDetails(id);
    if (res) order = await res;
    else console.error("Failed to fetch order (server):", res.statusText);
  } catch (err) {
    console.error("Error parsing order response (server):", err?.message || err);
  }

  return <OrdersClientWrapper initialOrder={order} id={id} />;
}
