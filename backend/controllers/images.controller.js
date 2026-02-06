import AppError from '../utils/AppError.js';
import {
  addProductImages,
  addVariantImages,
  getProductImages,
  deleteProductImage,
} from "../services/productImage.service.js";

import { processImageUploads } from "../services/imageUpload.service.js";
import { deleteImageSafely } from "../services/imageDelete.service.js";
import { supabase } from "../supabaseClient.js";

export async function uploadProductImagesController(req, res, next) {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    if (!req.files || req.files.length === 0) {
      throw new AppError('No images uploaded', 400, { code: 'NO_IMAGES_UPLOADED' });
    }

    const uploaded = await processImageUploads({
      files: req.files,
      folder: `${userId}/products/${productId}`,
    });

    const images = uploaded.map((img, index) => ({
      url: img.publicUrl,
      sort_order: index,
    }));

    const data = await addProductImages(productId, images);

    res.status(201).json({ data: data });
  } catch (err) {
    next(err);
  }
}

export async function uploadVariantImagesController(req, res, next) {
  try {
    const { variantId } = req.params;
    const { product_id, userId } = req.body;

    if (!product_id) {
      throw new AppError('product_id is required', 400, { code: 'MISSING_PRODUCT_ID' });
    }

    if (!req.files || req.files.length === 0) {
      throw new AppError('No images uploaded', 400, { code: 'NO_IMAGES_UPLOADED' });
    }

    const uploaded = await processImageUploads({
      files: req.files,
      folder: `${userId}/products/${product_id}/variants/${variantId}`,
    });

    const images = uploaded.map((img, index) => ({
      url: img.publicUrl,
      sort_order: index,
    }));

    const data = await addVariantImages({
      product_id,
      variant_id: variantId,
      images,
    });

    res.status(201).json({ data: data });
  } catch (err) {
    next(err);
  }
}

export async function getProductImagesController(req, res, next) {
  try {
    const { productId } = req.params;
    const images = await getProductImages(productId);
    res.json(images);
  } catch (err) {
    next(err);
  }
}

export async function deleteImageController(req, res, next) {
  try {
    const { imageId } = req.params;

    const { data: image, error } = await supabase
      .from("product_images")
      .select("id, image_url")
      .eq("id", imageId)
      .single();

    if (error || !image) {
      throw new AppError('Image not found', 404, { code: 'IMAGE_NOT_FOUND' });
    }

    await deleteImageSafely(image);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
