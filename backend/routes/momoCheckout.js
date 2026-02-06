import express from "express";
import asyncHandler from '../utils/asyncHandler.js';
import { momoCheckout } from "../controllers/checkoutController.js";


const router = express.Router();


router.post("/", asyncHandler(momoCheckout));

export default router;