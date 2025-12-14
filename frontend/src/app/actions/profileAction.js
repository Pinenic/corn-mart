"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function createProfile(user, url, phone) {
  const supabase = supabaseServer;

  const { error } = await supabase.from("users").insert([
    {
      id: user.id,
      full_name: user.user_metadata.first_name + " " + user.user_metadata.last_name,
      email: user.email,
      phone: phone,
      avatar_url: url,
    },
  ]);

  if (error) throw error;
}
