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

export const getProducts = async (req, res) => {
  const { storeId } = req.params;
  try {
    const products = await getProductsByStore(storeId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await getProductByID(productId);
    res.json(product);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};


export const createNewProduct = async (req, res) => {
  try {
    const { userId, name, description, price, store_id, category, subcat } = req.body;
    const subcategory = await createSubcategory(JSON.parse(subcat));
    const payload = { name, description, price, store_id, category, subcat_id:subcategory.id };
    const product = await createAProduct(payload);

    // Handle image upload if files were sent
    if (req.files && req.files.length > 0) {
      await uploadImages(userId, product.id, req.files);
    }

    res.status(201).json({ success: " true", response: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, newImages, removedImageIds, ...updates } = req.body;

    const product = await updateAProduct(productId, updates);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
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
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Clean up images first
    await deleteAllProductImages(productId);

    const response = await deleteAProduct(productId);
    res.json({ success: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const toggleActiveStatus = async (req, res) => {
  const { productId } = req.params;
  try {
    const { isActive } = req.body;
    const response = await toggleProductActiveStatus(productId, isActive);
    if (!response)
      res.status(404).json({ error: "product not found", id: req.params });
    res.json({ success: " true", response: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await getAllVariants(productId);
    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVariantById = async (req, res) => {
  try {
    const { variantId } = req.params;
    const variant = await getAVariant(variantId);
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createNewVariant = async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
};

export const updateVariant = async (req, res) => {
    try {
    const { variantId } = req.params;
    console.log(variantId);
    const updates = req.body;
    console.log(updates);
    const variant = await updateAVariant(variantId, updates);
    if (!variant)
      return res
        .status(404)
        .json({ error: "variant not found", id: req.params });
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const restockVariant = async (req, res) => {
    try {
    const { variantId } = req.params;
    console.log(variantId);
    const updates = req.body;
    console.log(updates);
    const variant = await updateAVariant(variantId, updates);
    if (!variant)
      return res
        .status(404)
        .json({ error: "variant not found", id: req.params });
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteVariant = async (req, res) => {
    try {
    const { variantId } = req.params;
    const response = await deleteAVariant(variantId);
    res.json({ success: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addProductImages = async (req, res) => {};

export const deleteProductImages = async (req, res) => {};
