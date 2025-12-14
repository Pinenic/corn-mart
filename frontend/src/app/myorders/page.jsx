import OrdersClient from "./OrdersClient";
import { getBuyerOrder, getStoreOrderDetails } from "@/lib/ordersApi";
import data from './data.json';
// import { createSupabaseServer } from "@/lib/supabaseServerClient";

export default async function Page({ params }) {
  // const supabase = createSupabaseServer();
  // const {data: {user}} = await supabase.auth.getUser();
  // let initialOrder = {};

  // try {
  //   initialOrder = await getBuyerOrder(user.id);
  // } catch (err) {
  //   // server-side fetch failed; client will handle retries
  //   console.error("Failed to fetch order on server:", err?.message || err);
  // }

  return (
    <div>
      {/* OrdersClient is a client component that manages interactivity and updates */}
      <OrdersClient />
    </div>
  );
}
