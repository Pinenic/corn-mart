import { supabase } from "../supabaseClient.js";
import { handleSupabaseError } from "../utils/handleSupabaseError.js";

export async function createOrder(cart_id, buyer_id) {
  
  
  try {
    // Set a timeout for the RPC call (30 seconds)
    // const controller = new AbortController();
    // const timeoutId = setTimeout(() => controller.abort(), 30000);

    const { data, error } = await supabase.rpc("create_reservation", {
    p_cart_id: cart_id,
    p_buyer_id: buyer_id,
  });
    
    // clearTimeout(timeoutId);
    
    if(error) throw handleSupabaseError(error, { message: "Failed to create order" });

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Create Order query timeout - request took too long');
    }
    throw err;
  }
}

/*
 * STATUS UPDATE METHODS FOR ORDERS
 */

export async function SellerShipOrder(storeOrderId, sellerId) {
  const { data, error } = await supabase.rpc("seller_update_store_order", {
    p_store_order_id: storeOrderId,
    p_action: "ship",
    p_seller_id: sellerId,
  });
  if (error) throw new Error(`${error}`);

  return data;
}

export async function SellerCancelOrder(storeOrderId, sellerId) {
  const { data, error } = await supabase.rpc("seller_update_store_order", {
    p_store_order_id: storeOrderId,
    p_action: "cancel",
    p_seller_id: sellerId,
  });
  if (error) throw new Error(`${error}`);

  return data;
}

export async function updateStoreOrderStatus(
  storeOrderId,
  storeId,
  action,
  actor_id,
  actorRole,
  metadata = null,
  comment = "Updated"
) {
  const { data, error } = await supabase.rpc("update_store_order_status", {
    p_store_order_id: storeOrderId,
    p_actor_id: actor_id,
    p_actor_role: actorRole,
    p_action: action,
    p_comment: comment,
    p_metadata: metadata,
  });

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

/*
 * CRUD OPERATIONS ON ORDERS
 */

export async function getBuyerOrders(buyer_id) {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*,store_orders(*, order_items(*))")
    .eq("buyer_id", buyer_id)
    .order("created_at", { ascending: false });

  if (ordersError) throw new Error(`Error fetching order, ${ordersError}`);
  return orders;
}

export async function getBuyerOrderDetails(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*,store_orders(*,stores(name, owner_id, logo), history:store_order_status_history(*), order_items(*, products(name, thumbnail_url), product_variants(name, price, image:product_images(image_url))))"
    )
    .eq("id", orderId)
    .single();

  if (error) throw new Error(`Error fetching the order, ${error}`);
  return data;
}

export async function getStoreOrders(storeId) {
  const { data: orders, error: ordersError } = await supabase
    .from("store_orders")
    .select("*, order_items(*,products(name, thumbnail_url)), order:order_id(buyer_id, users:buyer_id(id, full_name, email, avatar_url))")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (ordersError) {
    throw handleSupabaseError(ordersError, {
      message: "Failed to fetch store orders",
    });
  }

  // Transform the response to match expected format
  const ordersWithCustomer = orders.map((order) => {
    const customer = order.order?.users || {
      id: null,
      full_name: "Unknown",
      email: "unknown@example.com",
      avatar_url: null,
    };
    
    return {
      ...order,
      customer,
    };
  });

  return ordersWithCustomer;
}

export async function getStoreOrderDetails(orderId) {
  const { data, error } = await supabase
    .from("store_orders")
    .select("*, order_items(*,products(name, thumbnail_url)), order:order_id(buyer_id, users:buyer_id(id, full_name, email, avatar_url))")
    .eq("id", orderId)
    .single();

  if (error) throw handleSupabaseError(error, { message: "Failed to fetch store order details" });

  const customer = data.order?.users || {
    id: null,
    full_name: "Unknown",
    email: "unknown@example.com",
    avatar_url: null,
  };

  return { ...data, customer };
}

/**
 * ORDER CHAT METHODS
 */

export async function getOrderMessagesById(orderId) {
  const { data, error } = await supabase
    .from("order_messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Error fetching the messages, ${error.message}`);

  return data;
}

export async function postMessage(orderId, userId, role, message) {
  const { data, error } = await supabase
    .from("order_messages")
    .insert({
      order_id: orderId,
      sender_id: userId,
      sender_role: role,
      message,
    })
    .select()
    .single();

  if (error) throw new Error(`Error posting the message, ${error.message}`);

  return data;
}

export async function postImagesMessage(orderId, userId, role, files) {
  const messages = [];
  for (const file of files) {
    const ext = file.mimetype.split("/")[1];
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `${orderId}/${crypto.randomUUID()}-${filename}`;

    const { data, error } = await supabase.storage
      .from("order-chat-attachments")
      .upload(path, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(`Upload eror, ${error}`);

    const { data: urlData } = supabase.storage
      .from("order-chat-attachments")
      .getPublicUrl(path);

    const { data: msg } = await supabase
      .from("order_messages")
      .insert({
        order_id: orderId,
        sender_id: userId,
        sender_role: role,
        message: filename,
        message_type: file.mimetype.startsWith("image") ? "image" : "file",
        file_url: urlData.publicUrl,
        file_name: file.originalname,
        file_size: file.size,
      })
      .select()
      .single();

    messages.push(msg);
  }

  return messages;
}

export async function markChatasRead(orderId, userId) {
  const { data, error } = await supabase
    .from("order_chat_reads")
    .upsert({
      order_id: orderId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    })
    .select("last_read_at")
    .single();

  if (error) {
    throw new Error(`Error posting the message, ${error.message}`);
  }

  return { success: true };
}

export async function getLastRead(orderId, userId) {
  const { data, error } = await supabase
    .from("order_chat_reads")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(`Error posting the message, ${error.message}`);
  }

  return { last_read_at: data.last_read_at };
}

/**
 * HELPER FUNCTIONS
 */
