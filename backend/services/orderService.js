import { supabase } from "../supabaseClient.js";

export async function createOrder(cart_id, buyer_id) {
  const { data, error } = await supabase.rpc("create_reservation", {
    p_cart_id: cart_id,
    p_buyer_id: buyer_id,
  });
  if (error) throw new Error(`${error}`);

  return data;
}

export async function SellerConfirmOrder(storeOrderId, sellerId) {
  const { data, error } = await supabase.rpc("seller_update_store_order", {
    p_store_order_id: storeOrderId,
    p_action: "confirm",
    p_seller_id: sellerId,
  });
  if (error) throw new Error(`${error}`);

  return data;
}

export async function SellerCancelOrder(storeOrderId, sellerId) {
  const { data, error } = await supabase.rpc("seller_update_store_order", {
    p_store_order_id: storeOrderId,
    p_action: "confirm",
    p_seller_id: sellerId,
  });
  if (error) throw new Error(`${error}`);

  return data;
}

export async function updateStoreOrderStatus(
  storeOrderId,
  storeId,
  newStatus,
  metadata = {}
) {
  // Validate state transition
  const { data: current, error: fetchError } = await supabase
    .from("store_orders")
    .select("status")
    .eq("id", storeOrderId)
    .eq("store_id", storeId)
    .single();

  if (fetchError) {
    throw new Error(`Store order not found: ${fetchError.message}`);
  }

  if (!isValidTransition(current.status, newStatus)) {
    throw new Error(`Invalid transition: ${current.status} → ${newStatus}`);
  }

  // Update status (triggers will handle the rest)

  if (Object.keys(metadata).length === 0) {
    const { data, error } = await supabase
      .from("store_orders")
      .update({
        status: newStatus,
        updated_at: new Date(),
      })
      .eq("id", storeOrderId)
      .eq("store_id", storeId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from("store_orders")
    .update({
      status: newStatus,
      shipping_info: metadata,
      updated_at: new Date(),
    })
    .eq("id", storeOrderId)
    .eq("store_id", storeId)
    .select()
    .single();

  // Trigger notifications asynchronously
  // await notifyStatusChange(data);
  if (error) throw error;

  return data;
}

function isValidTransition(currentStatus, newStatus) {
  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus);
}

export async function getBuyerOrders(buyer_id) {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*,store_orders(*, order_items(*))")
    .eq("buyer_id", buyer_id);

  if (ordersError) throw new Error(`Error fetching order, ${ordersError}`);
  return orders;
}

export async function getBuyerOrderDetails(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*,store_orders(*,stores(name), order_items(*, products(name, thumbnail_url), product_variants(name, price)))"
    )
    .eq("id", orderId)
    .single();

  if (error) throw new Error(`Error fetching the order, ${error}`);
  return data;
}

export async function getStoreOrders(storeId) {
  const { data: orders, error: ordersError } = await supabase
    .from("store_orders")
    .select("*, order_items(*,products(name, thumbnail_url))")
    .eq("store_id", storeId);

  if (ordersError) throw new Error(`Error fetching order, ${ordersError}`);

  // 2️⃣ For each order, fetch customer info and merge it
  const ordersWithCustomer = await Promise.all(
    orders.map(async (order) => {
      const customer = await getCustomerInfo(order.order_id);
      return { ...order, customer };
    })
  );

  // 3️⃣ Return enriched results
  return ordersWithCustomer;
}

export async function getStoreOrderDetails(orderId) {
  const { data, error } = await supabase
    .from("store_orders")
    .select("*, order_items(*,products(name, thumbnail_url))")
    .eq("id", orderId)
    .single();

  if (error) throw new Error(`Error fetching the order, ${error}`);

  const customer = await getCustomerInfo(data.order_id);

  return { ...data, customer };
}

//profile helper
async function getCustomerInfo(oId) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, buyer_id")
    .eq("id", oId)
    .single();

  if (error) throw new Error(`Error fetching order info, ${error}`);

  const { data: customer, error: customerError } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("id", data.buyer_id)
    .single();

  if (customerError)
    throw new Error(`Error fetching customer info, ${customerError}`);

  return customer;
}
