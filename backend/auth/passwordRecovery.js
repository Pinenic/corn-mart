import { v4 as uuidv4 } from "uuid";

export const passwordRecovery = async (req, res) => {
  const hash = req.url.split("#")[1];
  const params = new URLSearchParams(hash);

  const access_token = params.get("access_token");

  if (!access_token) {
    return res.status(400).send("Invalid recovery link");
  }

  // Create temporary reset session
  const resetSessionId = uuidv4();

  // Store securely (Redis or DB recommended)
  global.resetSessions = global.resetSessions || {};
  global.resetSessions[resetSessionId] = {
    access_token,
    expires: Date.now() + 10 * 60 * 1000
  };

  // send safe cookie to browser
  res.cookie("reset_session", resetSessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });

  // redirect to frontend reset page
  res.redirect("https://yourfrontend.com/reset-password");
}