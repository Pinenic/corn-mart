import AppError from '../utils/AppError.js';
import {
  getProductsByStore,
  getProductByID,
  createAProduct,
  updateAProduct,
  toggleProductActiveStatus,
  deleteAProduct,
  createVariant,
  updateAVariant,
  getAllVariants,
  getAVariant,
  deleteAVariant,
  createSubcategory,
} from "../services/invetoryService.js";
import { deleteAllProductImages, updateProductImages, uploadProductImages } from "../services/productImageService.js";
import {uploadImages} from "../services/prodimageService.js"

export const getProducts = async (req, res, next) => {
  const { storeId } = req.params;
  try {
    const products = await getProductsByStore(storeId);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await getProductByID(productId);
    if (!product) throw new AppError('Product not found', 404, { code: 'PRODUCT_NOT_FOUND' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};


export const createNewProduct = async (req, res, next) => {
  try {
    const { userId, name, description, price, stock, store_id, category, subcat } = req.body;
    const subcategory = await createSubcategory(JSON.parse(subcat));
    const payload = { name, description, price, stock, store_id, category, subcat_id:subcategory.id };
    const product = await createAProduct(payload);

    // Handle image upload if files were sent
    if (req.files && req.files.length > 0) {
      await uploadImages(userId, product.id, req.files);
    }

    res.status(201).json({ success: " true", response: product });
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { userId, newImages, removedImageIds, ...updates } = req.body;

    const product = await updateAProduct(productId, updates);
    if (!product) {
      throw new AppError('Product not found', 404, { code: 'PRODUCT_NOT_FOUND' });
    }

    // Handle image updates if provided
    if (req.files?.length || removedImageIds?.length) {
      await updateProductImages(userId, productId, {
        newFiles: req.files || [],
        removedImageIds: removedImageIds || [],
      });
    }

    res.json({ success: " true", response: product });
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Clean up images first
    await deleteAllProductImages(productId);

    const response = await deleteAProduct(productId);
    res.json({ success: response });
  } catch (err) {
    next(err);
  }
}

export const toggleActiveStatus = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const { isActive } = req.body;
    const response = await toggleProductActiveStatus(productId, isActive);
    if (!response) throw new AppError('Product not found', 404, { code: 'PRODUCT_NOT_FOUND' });
    res.json({ success: " true", response: response });
  } catch (err) {
    next(err);
  }
};


export const getProductVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variants = await getAllVariants(productId);
    res.json(variants);
  } catch (err) {
    next(err);
  }
};

export const getVariantById = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const variant = await getAVariant(variantId);
    if (!variant) throw new AppError('Variant not found', 404, { code: 'VARIANT_NOT_FOUND' });
    res.json(variant);
  } catch (err) {
    next(err);
  }
};

export const createNewVariant = async (req, res, next) => {
  try {
    const { productId, name, description, price, stock, lowStockThreshold } = req.body;
    const variant = await createVariant({
      product_id: productId,
      name,
      description,
      price,
      stock,
      low_stock_threshold: lowStockThreshold,
    });
    res.json(variant);
  } catch (err) {
    next(err);
  }
};

export const updateVariant = async (req, res, next) => {
    try {
    const { variantId } = req.params;
    const updates = req.body;
    const variant = await updateAVariant(variantId, updates);
    if (!variant) throw new AppError('Variant not found', 404, { code: 'VARIANT_NOT_FOUND' });
    res.json(variant);
  } catch (err) {
    next(err);
  }
};

export const restockVariant = async (req, res, next) => {
    try {
    const { variantId } = req.params;
    const updates = req.body;
    const variant = await updateAVariant(variantId, updates);
    if (!variant) throw new AppError('Variant not found', 404, { code: 'VARIANT_NOT_FOUND' });
    res.json(variant);
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (req, res, next) => {
    try {
    const { variantId } = req.params;
    const response = await deleteAVariant(variantId);
    res.json({ success: response });
  } catch (err) {
    next(err);
  }
};

export const addProductImages = async (req, res) => {};

export const deleteProductImages = async (req, res) => {};
