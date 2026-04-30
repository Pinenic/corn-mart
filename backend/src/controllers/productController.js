// src/controllers/productController.js
import productService from "../services/productService.js";
import { processImageUploads } from "../services/imageUpload.service.js";
import response from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const productController = {
  // ── Products ───────────────────────────────────────────────

  // GET /api/v1/stores/:storeId/products
  list: asyncHandler(async (req, res) => {
    const { products, total } = await productService.list(
      req.store.id,
      req.query
    );
    return response.ok(
      res,
      products,
      response.pageMeta({ page: req.query.page, limit: req.query.limit, total })
    );
  }),

  // GET /api/v1/stores/:storeId/products/:productId
  getOne: asyncHandler(async (req, res) => {
    const product = await productService.getById(
      req.store.id,
      req.params.productId
    );
    if (!product) return response.notFound(res, "Product not found");
    return response.ok(res, product);
  }),

  // POST /api/v1/stores/:storeId/products
  create: asyncHandler(async (req, res) => {
    const product = await productService.create(req.store.id, req.body);
    return response.created(res, product);
  }),

  // PATCH /api/v1/stores/:storeId/products/:productId
  update: asyncHandler(async (req, res) => {
    const product = await productService.update(
      req.store.id,
      req.params.productId,
      req.body
    );
    if (!product) return response.notFound(res, "Product not found");
    return response.ok(res, product);
  }),

  // DELETE /api/v1/stores/:storeId/products/:productId
  // Soft delete — sets is_active = false
  delete: asyncHandler(async (req, res) => {
    const deleted = await productService.delete(
      req.store.id,
      req.params.productId
    );
    if (!deleted) return response.notFound(res, "Product not found");
    return response.noContent(res);
  }),

  // ── Variants ───────────────────────────────────────────────

  // GET /api/v1/stores/:storeId/products/:productId/variants
  listVariants: asyncHandler(async (req, res) => {
    const variants = await productService.listVariants(
      req.store.id,
      req.params.productId
    );
    if (!variants) return response.notFound(res, "Product not found");
    return response.ok(res, variants);
  }),

  // POST /api/v1/stores/:storeId/products/:productId/variants
  createVariant: asyncHandler(async (req, res) => {
    console.log(req.body);
    const variant = await productService.createVariant(
      req.store.id,
      req.params.productId,
      req.body
    );
    if (!variant) return response.notFound(res, "Product not found");
    return response.created(res, variant);
  }),

  // PATCH /api/v1/stores/:storeId/products/:productId/variants/:variantId
  updateVariant: asyncHandler(async (req, res) => {
    const variant = await productService.updateVariant(
      req.store.id,
      req.params.productId,
      req.params.variantId,
      req.body
    );
    if (!variant) return response.notFound(res, "Variant not found");
    return response.ok(res, variant);
  }),

  // DELETE /api/v1/stores/:storeId/products/:productId/variants/:variantId
  // Soft delete — sets is_active = false
  deleteVariant: asyncHandler(async (req, res) => {
    const deleted = await productService.deleteVariant(
      req.store.id,
      req.params.productId,
      req.params.variantId
    );
    if (!deleted) return response.notFound(res, "Variant not found");
    return response.noContent(res);
  }),

  // ── Images ─────────────────────────────────────────────────

  // POST /api/v1/stores/:storeId/products/:productId/images
  //  addImage: asyncHandler(async (req, res) => {
  //    const files = req.files || [];
  //    if (!Array.isArray(files) || files.length === 0) {
  //      return response.badRequest(res, "No image file provided", {
  //        field: "images",
  //        message: "At least one image is required",
  //      });
  //    }
  //
  //    // Upload image(s) to Supabase
  //    const uploads = await processImageUploads({
  //      files,
  //      folder: `products/${req.params.productId}`,
  //    });
  //
  //    if (!uploads || uploads.length === 0) {
  //      return response.serverError(res, "Failed to upload images");
  //    }
  //
  //    // Reuse common metadata from fields for each image entry
  //    const isThumbnail =
  //      req.body.is_thumbnail === true || req.body.is_thumbnail === "true";
  //    const sortOrder = req.body.sort_order ? parseInt(req.body.sort_order, 10) : 0;
  //    const variantId = req.body.variant_id || null;
  //
  //    const createdImages = [];
  //
  //    for (const upload of uploads) {
  //      const imagePayload = {
  //        image_url: upload.publicUrl,
  //        is_thumbnail: isThumbnail,
  //        sort_order: sortOrder,
  //        variant_id: variantId,
  //      };
  //
  //      const createdImage = await productService.addImage(
  //        req.store.id,
  //        req.params.productId,
  //        imagePayload
  //      );
  //
  //      if (!createdImage) {
  //        return response.notFound(res, "Product not found");
  //      }
  //
  //      createdImages.push(createdImage);
  //    }
  //
  //    return response.created(res, createdImages);
  //  })

  addImage: asyncHandler(async (req, res) => {
    const { storeId, productId } = req.params;

    // 1. Verify the product belongs to this store
    const product = await productService.getById(storeId, productId);
    if (!product) console.log("Product not found for: ", storeId, productId, product);
    if (!product) return response.notFound(res, "Product not found");

    // 2. Multer already ran — req.files holds the uploaded buffers
    if (!req.files || req.files.length === 0) {
      return response.badRequest(res, "At least one image file is required");
    }

    // 3. Resolve the default variant (created by DB trigger on product insert)
    const defaultVariant = await productService.getDefaultVariant(productId);
    if (!defaultVariant) {
      // Trigger hasn't fired yet or failed — this shouldn't happen in normal flow
      return response.unprocessable(
        res,
        "Default variant not found. The product may still be initialising — try again in a moment."
      );
    }

    // 4. Upload files to Supabase Storage
    // const { processImageUploads } = await import(
    //   "../helpers/processImageUploads.js"
    // );
    const uploaded = await processImageUploads({
      files: req.files,
      folder: `stores/${storeId}/products/${productId}`,
    });

    // 5. Insert rows into product_images with the default variant's ID
    const imageUrls = uploaded.map((u) => u.publicUrl);
    const images = await productService.addImages(
      productId,
      defaultVariant.id,
      imageUrls
    );

    return response.created(res, { images, variant_id: defaultVariant.id });
  }),

  // DELETE /api/v1/stores/:storeId/products/:productId/images/:imageId
  deleteImage: asyncHandler(async (req, res) => {
    const deleted = await productService.deleteImage(
      req.store.id,
      req.params.productId,
      req.params.imageId
    );
    if (!deleted) return response.notFound(res, "Image not found");
    return response.noContent(res);
  }),

  // PATCH /api/v1/stores/:storeId/products/:productId/images/reorder
  reorderImages: asyncHandler(async (req, res) => {
    const done = await productService.reorderImages(
      req.store.id,
      req.params.productId,
      req.body.images
    );
    if (!done) return response.notFound(res, "Product not found");
    return response.ok(res, { reordered: true });
  }),
};

export default productController;
