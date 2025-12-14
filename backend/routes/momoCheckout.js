import express from "express";
import { momoCheckout } from "../controllers/checkoutController.js";


const router = express.Router();


router.post("/", momoCheckout);

export default router;