/**
 * Product Controller
 * 
 * Handles HTTP requests for product-related operations.
 * 
 * Exports:
 * - getProducts: Get all products.
 * - getProductById: Get a single product by its ID.
 * - createProduct: Create a new product.
 * - updateProduct: Update an existing product.
 */

 /**
  * Get all products.
  * 
  * @async
  * @function
  * @param {import('express').Request} req - Express request object.
  * @param {import('express').Response} res - Express response object.
  * @returns {Promise<void>}
  */

 /**
  * Get a product by its ID.
  * 
  * @async
  * @function
  * @param {import('express').Request} req - Express request object.
  * @param {import('express').Response} res - Express response object.
  * @returns {Promise<void>}
  */

 /**
  * Create a new product.
  * 
  * @async
  * @function
  * @param {import('express').Request} req - Express request object.
  * @param {import('express').Response} res - Express response object.
  * @returns {Promise<void>}
  */

 /**
  * Update an existing product.
  * 
  * @async
  * @function
  * @param {import('express').Request} req - Express request object.
  * @param {import('express').Response} res - Express response object.
  * @returns {Promise<void>}
  */
 
import { getAllProducts, getProduct, createNewProduct, updateExistingProduct } from '../services/productService.js';

export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductsByStoreId = async (req, res) => {
  try {
    const {id} = req.params;
    const products = await getProductsByStore(id);
    res.json(products);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProduct(id);
    if (!product) return res.status(404).json({ error: 'Product not found'});
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, store_id, category } = req.body;
    const payload = {
      name,
      description,
      price,
      store_id,
      category
    }
    const product = await createAProduct(payload);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const updates = req.body;
    console.log(updates);
    const product = await updateAProduct(id, updates);
    if (!product) return res.status(404).json({ error: 'Product not found', id: req.params  });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
