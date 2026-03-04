import express from "express";
import asyncHandler from '../utils/asyncHandler.js';
import { forgotPassword } from "../auth/forgotPassword.js";
import { passwordRecovery } from "../auth/passwordRecovery.js";
import { resetPassword } from "../auth/resetPassword.js";

const router = express.Router();

router.post("/forgot-password", asyncHandler(forgotPassword));
router.get("/recovery", asyncHandler(passwordRecovery))
router.post("/reset", asyncHandler(resetPassword))

export default router;