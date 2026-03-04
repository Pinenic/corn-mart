import { supabase } from "../supabaseClient.js";

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://api.yoursite.com/auth/recovery",
  });

  res.json({
    success: true,
    message: "If account exists, reset email sent",
  });
};
