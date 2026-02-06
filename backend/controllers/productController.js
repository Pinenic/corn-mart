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

import {
  getAllProducts,
  getProduct,
  createNewProduct,
  updateExistingProduct,
  // getProductsByStore,
} from "../services/productService.js";
import AppError from "../utils/AppError.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// export const getProductsByStoreId = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const products = await getProductsByStore(id);
//     res.json(products);
//   } catch (error) {
//     next(error);
//   }
// };

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProduct(id);
    if (!product)
      throw new AppError("Product not found", 404, {
        code: "PRODUCT_NOT_FOUND",
      });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, store_id, category } = req.body;
    const payload = {
      name,
      description,
      price,
      store_id,
      category,
    };
    const product = await createNewProduct(payload);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await updateExistingProduct(id, updates);
    if (!product)
      throw new AppError("Product not found", 404, {
        code: "PRODUCT_NOT_FOUND",
        details: { id: req.params },
      });
    res.json(product);
  } catch (err) {
    next(err);
  }
};
