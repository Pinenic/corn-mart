// src/config/supabase.js
//
// Two Supabase clients:
//
//   supabaseAnon    — uses the anon key; respects Row Level Security.
//                     Use this when you want Postgres RLS to enforce
//                     access rules (e.g. user can only read their own store).
//
//   supabaseAdmin   — uses the service role key; bypasses RLS.
//                     Use ONLY for server-side operations that must cross
//                     ownership boundaries (e.g. analytics aggregations,
//                     payout processing, admin tasks).
//                     NEVER expose this client to the frontend.
//
// Most route handlers should use supabaseAdmin after validating ownership
// in the storeAccess middleware — this keeps auth logic in one place and
// avoids relying on RLS as the sole security layer at the API level.

import { createClient } from "@supabase/supabase-js";
import env from "./env.js";

const SUPABASE_OPTIONS = {
  auth: {
    autoRefreshToken:  false,
    persistSession:    false,
    detectSessionInUrl:false,
  },
};

// Anon client — respects RLS; used for auth.getUser() token validation
const supabaseAnon = createClient(
  env.supabase.url,
  env.supabase.anonKey,
  SUPABASE_OPTIONS
);

// Service role client — bypasses RLS; used for all data operations
// after the API layer has verified ownership
const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceKey,
  SUPABASE_OPTIONS
);

export { supabaseAnon, supabaseAdmin };
