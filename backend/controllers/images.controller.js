import {
  addProductImages,
  addVariantImages,
  getProductImages,
  deleteProductImage,
} from "../services/productImage.service.js";

import { processImageUploads } from "../services/imageUpload.service.js";
import { deleteImageSafely } from "../services/imageDelete.service.js";
import { supabase } from "../supabaseClient.js";

export async function uploadProductImagesController(req, res) {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
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
    res.status(500).json({ error: err.message });
  }
}

export async function uploadVariantImagesController(req, res) {
  try {
    const { variantId } = req.params;
    const { product_id, userId } = req.body;

    console.log(variantId, " and ", product_id);

    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
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
    res.status(500).json({ error: err.message });
  }
}

export async function getProductImagesController(req, res) {
  try {
    const { productId } = req.params;
    const images = await getProductImages(productId);
    res.json(images);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteImageController(req, res) {
  try {
    const { imageId } = req.params;

    const { data: image, error } = await supabase
      .from("product_images")
      .select("id, image_url")
      .eq("id", imageId)
      .single();

    if (error || !image) {
      return res.status(404).json({ error: "Image not found" });
    }

    await deleteImageSafely(image);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
