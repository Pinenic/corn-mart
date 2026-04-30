import { v4 as uuidv4 } from "uuid";

export const passwordRecovery = async (req, res) => {
  const access_token = req.body?.access_token || req.query.access_token;

  // console.log(access_token);

  if (!access_token) {
    return res.status(400).json({ error: "Invalid recovery link" });
  }

  const resetSessionId = uuidv4();
  global.resetSessions = global.resetSessions || {};
  global.resetSessions[resetSessionId] = {
    access_token,
    expires: Date.now() + 10 * 60 * 1000,
  };

  res.cookie("reset_session", resetSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  // Return JSON instead of redirecting (let Next.js handle the redirect)
  res.status(200).json({ success: true });
};
