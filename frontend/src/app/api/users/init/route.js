// src/app/api/users/init/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "user_uploads"; // ensure this bucket exists in Supabase UI
const INIT_FILENAME = ".init";

async function ensureUserFolder(userId, maxAttempts = 3) {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      // upload a tiny placeholder to ensure folder exists
      const path = `${userId}/${INIT_FILENAME}`;
      const content = new Blob(["init"], { type: "text/plain" });

      // If file already exists, this will return 409; handle it gracefully
      const { error: uploadErr } = await supabaseServer.storage
        .from(BUCKET)
        .upload(path, content, { upsert: false });

      if (uploadErr) {
        // If object already exists, treat as success. Supabase returns 409 on conflict.
        if (uploadErr.status === 409) {
          return { ok: true, message: "Folder already exists" };
        }
        throw uploadErr;
      }

      // success
      return { ok: true, message: "Created folder" };
    } catch (err) {
      lastError = err;
      // exponential backoff: 500ms, 1000ms, 2000ms...
      const backoff = 500 * Math.pow(2, attempt - 1);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }

  return { ok: false, error: lastError };
}

export async function POST(request) {
  try {
    // Authorization: Bearer <access_token>
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // Create a client with the user's token to verify identity
    const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, token);

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const body = await request.json();
    // body can include profile fields e.g. { name, avatar_url, meta: {...} }
    const { name, avatar_url, extra = {} } = body || {};

    const userId = user.id;

    // Upsert (insert or update) the users profile table server-side using service role
    // Column names assumed: supabase_uid, email, name, avatar_url, metadata
    const profilePayload = {
      supabase_uid: userId,
      email: user.email,
      name: name || user.user_metadata?.full_name || null,
      avatar_url: avatar_url || null,
      metadata: extra,
      updated_at: new Date().toISOString(),
    };

    // Use upsert to avoid duplicates; set returning
    const { data: profileData, error: profileErr } = await supabaseServer
      .from("users")
      .upsert(profilePayload, { onConflict: "supabase_uid" })
      .select()
      .single();

    if (profileErr) {
      console.error("Profile upsert error:", profileErr);
      return NextResponse.json({ error: "Failed to create/update profile" }, { status: 500 });
    }

    // Ensure user folder exists (with retries inside)
    const folderResult = await ensureUserFolder(userId, 4);
    if (!folderResult.ok) {
      console.error("Folder creation failed:", folderResult.error);
      return NextResponse.json({ error: "Failed to initialize user storage" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "User initialized",
      profile: profileData,
      folder: folderResult.message,
    });
  } catch (err) {
    console.error("Unexpected /api/users/init error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
