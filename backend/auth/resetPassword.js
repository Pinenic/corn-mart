import { createClient } from "@supabase/supabase-js";

// Admin client 
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export const resetPassword = async (req, res) => {
  const sessionId = req.cookies.reset_session;
  const session = global.resetSessions?.[sessionId];

  if (!session || session.expires < Date.now()) {
    console.log("Reset session expired" )
    return res.status(401).json({ message: "Reset session expired" });
  }

  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    console.log("Password must be at least 8 characters" )
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  // Decode the access_token to get user's ID
  const payload = JSON.parse(Buffer.from(session.access_token.split(".")[1], "base64").toString());
  const userId = payload.sub;

  // Use admin client to update password directly
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    console.log(error.message)
    return res.status(400).json({ message: error.message });
  }

  delete global.resetSessions[sessionId];
  res.clearCookie("reset_session");
  res.json({ success: true, message: "Password updated" });
};
