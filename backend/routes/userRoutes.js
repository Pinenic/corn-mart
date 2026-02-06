import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { getUsers, getUserById } from '../controllers/userController.js';

const router = express.Router();

router.get('/', asyncHandler(getUsers));          // Get all users
router.get('/:id', asyncHandler(getUserById));   // Get a single user by ID

export default router;
