import express from "express";
import { getAnalytics } from "../controllers/anaytics.controller.js";

const router = express.Router();

router.post("/:storeId", getAnalytics);

export default router;