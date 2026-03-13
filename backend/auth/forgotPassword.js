import { supabase } from "../supabaseClient.js";

export const forgotPassword = async (req, res, next) => {
   try {
    //  console.log(req.body);
      const { email } = req.body;

     if (!email) {
       return res.status(400).json({
         success: false,
         message: "Email is required",
       });
     }

     await supabase.auth.resetPasswordForEmail(email, {
       redirectTo: `${
         process.env.FRONTEND_URL || "http://localhost:3000"
       }/recovery/redirect`,
     });

     res.json({
       success: true,
       message: "If account exists, reset email sent",
     });
   } catch (error) {
     console.error("Forgot password error:", error);
     res.status(500).json({
       success: false,
       message: "Failed to process password reset request",
       error: process.env.NODE_ENV === "development" ? error.message : undefined,
     });
   }
};
