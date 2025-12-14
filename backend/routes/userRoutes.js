import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);          // Get all users
router.get('/:id', getUserById);   // Get a single user by ID

export default router;
