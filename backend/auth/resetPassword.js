import { supabase } from "../supabaseClient.js";

export const resetPassword = async (req, res) => {
  const sessionId = req.cookies.reset_session;

  const session = global.resetSessions?.[sessionId];

  if (!session || session.expires < Date.now()) {
    return res.status(401).json({
      message: "Reset session expired",
    });
  }

  // authenticate temporarily
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: null,
  });

  if (sessionError) {
    return res.status(401).json({ message: "Invalid session" });
  }

  const { newPassword } = req.body;

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // destroy reset session
  delete global.resetSessions[sessionId];

  res.clearCookie("reset_session");

  res.json({
    success: true,
    message: "Password updated",
  });
};
