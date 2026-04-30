// src/middleware/validate.js
// Request validation middleware using Joi.
// Creates a middleware that validates req.body, req.query, or req.params
// against a Joi schema and returns a 400 with field-level errors on failure.
//
// Usage:
//   const { validateBody, validateQuery } = require("../middleware/validate");
//   router.post("/", validateBody(schemas.createProduct), controller.create);

import Joi from "joi";
import response from "../utils/response.js";

// Internal factory
function validate(source, schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // collect ALL errors, not just the first
      stripUnknown: true, // silently drop fields not in schema
      convert: true, // coerce types (e.g. "3" → 3 for Joi.number())
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message.replace(/['"]/g, ""),
      }));
      return response.badRequest(res, "Validation failed", details);
    }

    // Replace with sanitised/coerced value
   // ✅ For query/params (read-only getters), mutate the existing object.
    // For body (writable), direct assignment still works but Object.assign
    // is consistent and safe for all three sources.
    if (source === "query" || source === "params") {
      // Clear existing keys then copy validated (coerced/stripped) values in.
      // Can't replace the reference, so mutate in place.
      Object.keys(req[source]).forEach((k) => delete req[source][k]);
      Object.assign(req[source], value);
    } else {
      req[source] = value;
    }

    next();
  };
}

const validateBody = (schema) => validate("body", schema);
const validateQuery = (schema) => validate("query", schema);
const validateParams = (schema) => validate("params", schema);

// ── Common reusable schemas ───────────────────────────────────

const uuid = Joi.string().uuid({ version: "uuidv4" });

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ── Store schemas ─────────────────────────────────────────────
const updateStoreSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(1000).allow("", null),
  logo: Joi.string().uri().allow(null),
  banner: Joi.string().uri().allow(null),
}).min(1); // at least one field required

// ── Order schemas ─────────────────────────────────────────────
const orderStatusValues = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...orderStatusValues)
    .required(),
  comment: Joi.string().max(500).allow("", null),
});

const orderQuerySchema = paginationSchema.keys({
  status: Joi.string()
    .valid(...orderStatusValues, "all")
    .default("all"),
  dateFrom: Joi.string().isoDate().allow("", null),
  dateTo: Joi.string().isoDate().allow("", null),
  search: Joi.string().max(100).allow("", null),
  sort: Joi.string()
    .valid("created_at", "subtotal", "status")
    .default("created_at"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

// ── Product schemas ───────────────────────────────────────────
const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000).allow("", null),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).default(0),
  category: Joi.string().max(100).allow(null),
  brand: Joi.string().max(100).allow("", null),
  subcat_id: Joi.number().integer().positive().allow(null),
  is_active: Joi.boolean().default(true),
});

const updateProductSchema = createProductSchema
  .fork(["name", "price"], (f) => f.optional())
  .min(1);

const productQuerySchema = paginationSchema.keys({
  status: Joi.string().valid("active", "inactive", "all").default("all"),
  category: Joi.string().max(100).allow("", null),
  search: Joi.string().max(100).allow("", null),
  sort: Joi.string()
    .valid("name", "price", "stock", "created_at", "updated_at")
    .default("created_at"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

// ── Variant schemas ───────────────────────────────────────────
const createVariantSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  sku: Joi.string().max(100).allow("",null),
  price: Joi.number().positive().precision(2).allow(null),
  stock: Joi.number().integer().min(0).default(0),
  reserved_stock: Joi.number().integer().min(0).default(0),
  low_stock_threshold: Joi.number().integer().min(0).default(3),
  description: Joi.string().max(2000).allow("", null),
  is_active: Joi.boolean().default(true),
  options: Joi.array(),
});

const updateVariantSchema = createVariantSchema
  .fork(["name"], (f) => f.optional())
  .min(1);

// ── Image schemas ─────────────────────────────────────────────
const addImageSchema = Joi.object({
  image_url: Joi.string().uri().required(),
  is_thumbnail: Joi.boolean().default(false),
  sort_order: Joi.number().integer().min(0).default(0),
  variant_id: uuid.allow(null).default(null),
});

const reorderImagesSchema = Joi.object({
  // Array of { id: uuid, sort_order: number }
  images: Joi.array()
    .items(
      Joi.object({
        id: uuid.required(),
        sort_order: Joi.number().integer().min(0).required(),
      })
    )
    .min(1)
    .required(),
});

// ── Location schemas ──────────────────────────────────────────
const locationSchema = Joi.object({
  address: Joi.string().max(500).allow(null),
  city: Joi.string().max(100).allow(null),
  province: Joi.string().max(100).allow(null),
  country: Joi.string().max(100).allow(null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  delivery_enabled: Joi.boolean().default(false),
  delivery_radius_km: Joi.number().positive().allow(null),
  delivery_fee: Joi.number().min(0).allow(null),
  delivery_methods: Joi.array().items(Joi.string()).default([]),
});

// ── Analytics schemas ─────────────────────────────────────────
const analyticsQuerySchema = Joi.object({
  period: Joi.string().valid("7d", "30d", "90d", "12m").default("30d"),
  dateFrom: Joi.string().isoDate().allow(null),
  dateTo: Joi.string().isoDate().allow(null),
});

// ── Marketplace: store browse ──────────────────────────────────
const marketplaceStoreQuerySchema = paginationSchema.keys({
  search: Joi.string().max(100).allow("", null),
  category: Joi.string().max(100).allow("", null),
  sort: Joi.string()
    .valid("followers_count", "created_at", "name")
    .default("followers_count"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

// ── Marketplace: product browse ────────────────────────────────
const marketplaceProductQuerySchema = paginationSchema.keys({
  search: Joi.string().max(200).allow("", null),
  category: Joi.string().max(100).allow("", null),
  subcat_id: Joi.number().integer().positive().allow(null),
  min_price: Joi.number().min(0).allow(null),
  max_price: Joi.number().min(0).allow(null),
  store_id: uuid.allow(null),
  sort: Joi.string().valid("price", "created_at", "name").default("created_at"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

// ── Marketplace: place order ───────────────────────────────────
const placeOrderSchema = Joi.object({
  // The cart Id for the cart o checkout
  cart_id: Joi.string().max(200),

  // Shipping info stored as JSONB on store_orders
  shipping_info: Joi.object({
    name: Joi.string().max(200).allow("", null),
    phone: Joi.string().max(30).allow("", null),
    address: Joi.string().max(500).allow("", null),
    city: Joi.string().max(100).allow("", null),
    country: Joi.string().max(100).allow("", null),
  }).allow(null),

  // Note to the seller
  note: Joi.string().max(1000).allow("", null),
});

// ── Marketplace: cancel order ──────────────────────────────────
const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(500).allow("", null),
});

// ── Marketplace: notifications query ──────────────────────────
const notificationQuerySchema = paginationSchema.keys({
  type: Joi.string()
    .valid("info", "success", "warning", "error", "all")
    .default("all"),
  is_read: Joi.boolean().allow(null),
});

const schemas = {
  updateStore: updateStoreSchema,
  updateOrderStatus: updateOrderStatusSchema,
  orderQuery: orderQuerySchema,
  createProduct: createProductSchema,
  updateProduct: updateProductSchema,
  productQuery: productQuerySchema,
  createVariant: createVariantSchema,
  updateVariant: updateVariantSchema,
  addImage: addImageSchema,
  reorderImages: reorderImagesSchema,
  location: locationSchema,
  analyticsQuery: analyticsQuerySchema,
  pagination: paginationSchema,
  // Marketplace
  marketplaceStoreQuery: marketplaceStoreQuerySchema,
  marketplaceProductQuery: marketplaceProductQuerySchema,
  placeOrder: placeOrderSchema,
  cancelOrder: cancelOrderSchema,
  notificationQuery: notificationQuerySchema,
};

export { validateBody, validateQuery, validateParams, schemas };
