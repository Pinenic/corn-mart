"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function createUserFolder(userId) {
  const supabase = supabaseServer;
  try {
    const { data, error } = await supabase.storage.from("user_uploads").upload(
      `${userId}/.init`,
      new Blob(["init"], { type: "text/plain" })
    );
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating folder:", err);
    throw new Error("Failed to create user folder");
  }
}
