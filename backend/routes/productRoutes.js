import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, getProductsByStoreId } from '../controllers/productController.js';

const router = express.Router();

// Get all products
router.get('/', getProducts);

// Get products for a store
router.get('/store/:id', getProductsByStoreId);

// Get a single product by ID
router.get('/:id', getProductById);

// Create a new product
router.post('/', createProduct);

// Update a product
router.put('/:id', updateProduct);

export default router;
