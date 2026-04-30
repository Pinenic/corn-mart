// src/middleware/storeAccess.js
// Verifies that the authenticated user (req.user) is the owner of
// the store identified by req.params.storeId.
//
// Must run AFTER the authenticate middleware.
//
// On success: attaches req.store to the request so controllers don't
// need to re-fetch it.
//
// Why check ownership here instead of relying on RLS?
//   RLS is a great defence-in-depth layer but it's not a substitute
//   for explicit authorisation checks at the API boundary.
//   Relying solely on RLS means a misconfigured policy silently
//   returns empty data instead of a 403, making bugs hard to spot.
//   Belt and braces.

import { supabaseAdmin } from "../config/supabase.js";
import response from "../utils/response.js";
import logger from "../utils/logger.js";

async function requireStoreAccess(req, res, next) {
  const { storeId } = req.params;

  if (!storeId) {
    return response.badRequest(res, "storeId param is required");
  }

  const { data: store, error } = await supabaseAdmin
    .from("stores")
    .select("id, owner_id, name, is_verified")
    .eq("id", storeId)
    .single();

  if (error || !store) {
    return response.notFound(res, "Store not found");
  }

  if (store.owner_id !== req.user.id) {
    // Log potential probing attempt
    logger.warn("Store access denied", {
      userId:  req.user.id,
      storeId,
      ip:      req.ip,
    });
    return response.forbidden(res);
  }

  req.store = store;
  next();
}

export { requireStoreAccess };
