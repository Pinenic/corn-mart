import express from "express";
import { processPayouts } from "../utils/payoutHandler.js";

const router = express.Router();

// POST /api/payouts/run
router.post("/run", async (req, res) => {
  try {
    // Optionally add admin auth here
    await processPayouts();
    res.status(200).json({ success: true, message: "Payout job executed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
