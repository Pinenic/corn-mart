# Storely API

Node.js + Express + Supabase backend serving both the **store owner dashboard**
and the **buyer marketplace** from a single Express application.

---

## Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Runtime    | Node.js 18+                      |
| Framework  | Express 4                        |
| Database   | Supabase (Postgres)              |
| Auth       | Supabase Auth (JWT)              |
| Validation | Joi                              |
| Security   | Helmet, CORS, express-rate-limit |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, SUPABASE_JWT_SECRET

# 3. Start dev server (with auto-reload)
npm run dev

# 4. Start production server
npm start
```

---

## Project structure

```
storely-api/
├── server.js                         — process entry point + graceful shutdown
├── src/
│   ├── app.js                        — Express setup: middleware stack in order
│   ├── config/
│   │   ├── env.js                    — validates required env vars at startup
│   │   └── supabase.js               — supabaseAnon (JWT) + supabaseAdmin (data)
│   ├── middleware/
│   │   ├── auth.js                   — JWT verification via getUser(), attaches req.user
│   │   ├── storeAccess.js            — ownership check, attaches req.store
│   │   ├── validate.js               — Joi schemas + validateBody/Query/Params factories
│   │   ├── rateLimit.js              — tiered limiters: auth/write/read/analytics/public
│   │   └── errorHandler.js           — global error handler + 404 handler
│   ├── utils/
│   │   ├── response.js               — standard JSON shape helpers
│   │   ├── asyncHandler.js           — wraps async route handlers, forwards errors
│   │   └── logger.js                 — structured logger (JSON in prod, readable in dev)
│   ├── services/                     — all Supabase queries live here, no Express
│   │   ├── storeService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── analyticsService.js
│   │   ├── categoryService.js
│   │   └── marketplace/
│   │       ├── marketplaceStoreService.js    — browse stores, follow/unfollow
│   │       ├── marketplaceProductService.js  — public product search + detail
│   │       └── marketplaceBuyerService.js    — orders, cancel, notifications
│   ├── controllers/                  — HTTP handlers: call service, return response
│   │   ├── storeController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── analyticsController.js
│   │   ├── categoryController.js
│   │   └── marketplace/
│   │       ├── marketplaceStoreController.js
│   │       ├── marketplaceProductController.js
│   │       └── marketplaceBuyerController.js
│   └── routes/
│       ├── index.js                  — mounts all routers under /api/v1
│       ├── stores.js
│       ├── orders.js
│       ├── products.js
│       ├── categories.js
│       ├── analytics.js
│       └── marketplace/
│           ├── stores.js             — public browse + authenticated follow
│           ├── products.js           — public product search + detail
│           └── buyer.js              — orders + notifications [all auth required]
```

---

## API reference

### Response shape

```json
// Success
{ "success": true, "data": <payload>, "meta": <pagination?> }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "...", "details": [...] } }
```

### Pagination meta

```json
{
  "page": 1, "limit": 20, "total": 138,
  "totalPages": 7, "hasNextPage": true, "hasPrevPage": false
}
```

---

## Dashboard API (store owner)

All dashboard routes require:
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

### Stores

| Method | URL                                       | Description                  |
|--------|-------------------------------------------|------------------------------|
| GET    | `/api/v1/stores/mine`                     | All stores owned by the user |
| GET    | `/api/v1/stores/:storeId`                 | Single store                 |
| PATCH  | `/api/v1/stores/:storeId`                 | Update store profile         |
| GET    | `/api/v1/stores/:storeId/locations`       | All delivery locations       |
| POST   | `/api/v1/stores/:storeId/locations`       | Add a location               |
| PATCH  | `/api/v1/stores/:storeId/locations/:id`   | Update a location            |
| DELETE | `/api/v1/stores/:storeId/locations/:id`   | Remove a location            |

### Orders

| Method | URL                                                  | Description                        |
|--------|------------------------------------------------------|------------------------------------|
| GET    | `/api/v1/stores/:storeId/orders`                     | List orders (filtered, paginated)  |
| GET    | `/api/v1/stores/:storeId/orders/status-counts`       | Counts per status for filter tabs  |
| GET    | `/api/v1/stores/:storeId/orders/:orderId`            | Order detail + status history      |
| PATCH  | `/api/v1/stores/:storeId/orders/:orderId/status`     | Advance order through status machine|
| GET    | `/api/v1/stores/:storeId/orders/:orderId/history`    | Full status change audit log       |

**Order query params:** `page`, `limit`, `status`, `dateFrom`, `dateTo`, `search`, `sort`, `order`

**Status machine:** `pending` → `confirmed` → `processing` → `shipped` → `delivered` → `refunded`
(any status → `cancelled`)

### Products

| Method | URL                                                              | Description               |
|--------|------------------------------------------------------------------|---------------------------|
| GET    | `/api/v1/stores/:storeId/products`                              | List products             |
| POST   | `/api/v1/stores/:storeId/products`                              | Create product            |
| GET    | `/api/v1/stores/:storeId/products/:productId`                   | Product + variants + images|
| PATCH  | `/api/v1/stores/:storeId/products/:productId`                   | Update product            |
| DELETE | `/api/v1/stores/:storeId/products/:productId`                   | Soft-delete (is_active=false)|
| GET    | `/api/v1/stores/:storeId/products/:productId/variants`          | List variants             |
| POST   | `/api/v1/stores/:storeId/products/:productId/variants`          | Create variant            |
| PATCH  | `/api/v1/stores/:storeId/products/:productId/variants/:id`      | Update variant            |
| DELETE | `/api/v1/stores/:storeId/products/:productId/variants/:id`      | Soft-delete variant       |
| POST   | `/api/v1/stores/:storeId/products/:productId/images`            | Add image                 |
| PATCH  | `/api/v1/stores/:storeId/products/:productId/images/reorder`    | Batch reorder by sort_order|
| DELETE | `/api/v1/stores/:storeId/products/:productId/images/:id`        | Remove image              |

**Product query params:** `page`, `limit`, `status` (active/inactive/all), `category`, `search`, `sort`, `order`

### Analytics

| Method | URL                                                       | Description                       |
|--------|-----------------------------------------------------------|-----------------------------------|
| GET    | `/api/v1/stores/:storeId/analytics/overview`             | KPI cards with period comparison  |
| GET    | `/api/v1/stores/:storeId/analytics/revenue`              | Daily revenue time series         |
| GET    | `/api/v1/stores/:storeId/analytics/orders-by-status`     | Order counts per status           |
| GET    | `/api/v1/stores/:storeId/analytics/products`             | Top products by revenue           |
| GET    | `/api/v1/stores/:storeId/analytics/followers`            | Follower growth series            |
| GET    | `/api/v1/stores/:storeId/analytics/categories`           | Revenue share by category         |

**Analytics query params:** `period` (7d/30d/90d/12m), `dateFrom` (ISO date), `dateTo` (ISO date)

### Categories

| Method | URL                                        | Description                    |
|--------|--------------------------------------------|--------------------------------|
| GET    | `/api/v1/categories`                       | All categories + subcategories |
| GET    | `/api/v1/categories/flat`                  | Categories only (for dropdowns)|
| GET    | `/api/v1/categories/:id/subcategories`     | Subcategories for a category   |

---

## Marketplace API (buyer)

### Auth tiers

| Tier     | Description                                      | Header required |
|----------|--------------------------------------------------|-----------------|
| Public   | Browse stores, products, categories              | None            |
| Optional | Store profile — enhanced with follow status      | Optional        |
| Auth     | Place orders, follow stores, notifications       | Required        |

### Marketplace — Stores

| Method | URL                                            | Auth     | Description                    |
|--------|------------------------------------------------|----------|--------------------------------|
| GET    | `/api/v1/marketplace/stores`                  | Public   | Browse/search all stores       |
| GET    | `/api/v1/marketplace/stores/:storeId`         | Optional | Store profile + follow status  |
| GET    | `/api/v1/marketplace/stores/:storeId/products`| Public   | Store's active products        |
| GET    | `/api/v1/marketplace/stores/:storeId/locations`| Public  | Delivery locations             |
| POST   | `/api/v1/marketplace/stores/:storeId/follow`  | Required | Follow a store                 |
| DELETE | `/api/v1/marketplace/stores/:storeId/follow`  | Required | Unfollow a store               |

**Store query params:** `page`, `limit`, `search`, `sort` (followers_count/created_at/name), `order`

### Marketplace — Products

| Method | URL                                        | Auth   | Description                          |
|--------|--------------------------------------------|--------|--------------------------------------|
| GET    | `/api/v1/marketplace/products`             | Public | Global product search across all stores|
| GET    | `/api/v1/marketplace/products/:productId`  | Public | Product detail + active variants + images|

**Product query params:** `page`, `limit`, `search`, `category`, `subcat_id`, `min_price`, `max_price`, `store_id`, `sort` (price/created_at/name), `order`

### Marketplace — Buyer orders

| Method | URL                                              | Auth     | Description                          |
|--------|--------------------------------------------------|----------|--------------------------------------|
| POST   | `/api/v1/marketplace/orders`                     | Required | Place an order (contact-seller model)|
| GET    | `/api/v1/marketplace/orders`                     | Required | Buyer's order history                |
| GET    | `/api/v1/marketplace/orders/:orderId`            | Required | Order detail with line items         |
| PATCH  | `/api/v1/marketplace/orders/:orderId/cancel`     | Required | Cancel a pending or confirmed order  |

**Place order body:**
```json
{
  "items": [
    { "product_id": "uuid", "variant_id": "uuid|null", "quantity": 2 }
  ],
  "shipping_info": {
    "name": "Ama Kusi", "phone": "+233...",
    "address": "14 Ring Road", "city": "Accra", "country": "GH"
  },
  "note": "Please call before delivery"
}
```

**Order placement notes:**
- Items spanning multiple stores create one `store_order` per store automatically
- `payment_status` starts as `unpaid` — payment is arranged externally between buyer and seller
- Stock is not decremented on placement; it decrements when the store confirms the order
- Stock availability is checked on placement and will reject orders exceeding `available_stock`

### Marketplace — Notifications

| Method | URL                                                   | Auth     | Description                |
|--------|-------------------------------------------------------|----------|----------------------------|
| GET    | `/api/v1/marketplace/notifications`                   | Required | Buyer notifications list   |
| PATCH  | `/api/v1/marketplace/notifications/read-all`          | Required | Mark all notifications read|
| PATCH  | `/api/v1/marketplace/notifications/:id/read`          | Required | Mark one notification read |

**Notification query params:** `page`, `limit`, `type` (info/success/warning/error/all), `is_read` (boolean)

**Notification meta** includes `unread` count alongside standard pagination.

---

## Error codes

| Code                  | HTTP | Meaning                                                 |
|-----------------------|------|---------------------------------------------------------|
| `BAD_REQUEST`         | 400  | Missing or invalid fields (see `details` array)         |
| `UNAUTHORISED`        | 401  | No token or token invalid/expired                       |
| `FORBIDDEN`           | 403  | Authenticated but not the resource owner                |
| `NOT_FOUND`           | 404  | Resource doesn't exist or belongs to another user       |
| `CONFLICT`            | 409  | Duplicate (e.g. SKU already in use)                     |
| `UNPROCESSABLE`       | 422  | Business logic violation                                |
| `INVALID_TRANSITION`  | 422  | Order status can't move to the requested status         |
| `DUPLICATE_SKU`       | 409  | SKU already exists in the catalogue                     |
| `PRODUCT_NOT_FOUND`   | 422  | Product in order doesn't exist                          |
| `PRODUCT_UNAVAILABLE` | 422  | Product in order is inactive                            |
| `VARIANT_NOT_FOUND`   | 422  | Variant in order doesn't exist or doesn't match product |
| `VARIANT_UNAVAILABLE` | 422  | Variant in order is inactive                            |
| `INSUFFICIENT_STOCK`  | 422  | Requested quantity exceeds available_stock              |
| `RATE_LIMITED`        | 429  | Too many requests                                       |
| `SERVER_ERROR`        | 500  | Unexpected server error                                 |

---

## Rate limits

| Limiter     | Used on                           | Limit (default)  |
|-------------|-----------------------------------|------------------|
| `auth`      | Future auth endpoints             | 20 req / 15 min  |
| `write`     | POST, PATCH, DELETE               | 100 req / 15 min |
| `read`      | Authenticated GET                 | 300 req / 15 min |
| `analytics` | `/analytics/*`                    | 500 req / 15 min |
| `public`    | Marketplace public browse (GET)   | 1000 req / 15 min|

Headers returned: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

---

## ⚠ Known issues & recommendations

### 1. Plaintext account numbers — HIGH PRIORITY
`stores.account_number` and `store_orders.account_number` hold payout bank details
in plaintext. The API never returns these fields, but they're still exposed in the
database. Before going to production:
- Encrypt at rest using `pgcrypto` (AES-256), or
- Remove the column and store a payment processor token (Paystack, Stripe) instead.

### 2. Missing `promotions` table
The dashboard promotions UI has no backing table. Suggested migration:

```sql
create table public.promotions (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null references stores(id) on delete cascade,
  name            text not null,
  code            text not null,
  type            text not null check (type in ('percentage','fixed','bogo','free_shipping','bundle')),
  value           numeric(10,2),
  applies_to      text not null default 'all' check (applies_to in ('all','category','products')),
  product_ids     uuid[]   default '{}',
  category_ids    text[]   default '{}',
  min_order_value numeric(10,2),
  max_uses        integer,
  uses            integer  not null default 0,
  starts_at       timestamptz,
  ends_at         timestamptz,
  is_active       boolean  not null default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index on promotions(store_id);
create index on promotions(code);
create unique index on promotions(store_id, code);
```

### 3. Dual image storage
`products.images` (JSONB) and the `product_images` table both exist and may
get out of sync. Treat `product_images` as canonical for all API writes and reads.
Either drop `products.images` or add a trigger to keep it in sync if legacy
consumers read from it.

### 4. No `deleted_at` soft-delete column
Products and variants use `is_active = false` as a soft delete but have no
`deleted_at` timestamp. Consider adding one if you need point-in-time state
queries (e.g. "what was the product catalogue at the time of this order?").

### 5. Stock reservation on order confirmation
Currently, `reserved_stock` on variants is not incremented by the API. The
recommended flow is: increment `reserved_stock` when a store confirms an order,
then decrement `stock` and `reserved_stock` when the order is marked delivered.
This keeps `available_stock` (the generated column) accurate for concurrent buyers.

### 6. `store_order_status_history` actor
The `actor_id` column is nullable — correct for system-generated transitions.
In the dashboard UI, distinguish null-actor events ("System") from store-owner
events (show the owner's name) for a clear audit trail.

---

## Scaling checklist (before production)

- [ ] Switch rate limiter from in-memory to Redis (`rate-limit-redis` + `ioredis`)
- [ ] Add Redis response caching for analytics and marketplace browse endpoints
- [ ] Encrypt `account_number` columns or migrate to payment processor tokens
- [ ] Create the `promotions` table (migration SQL above)
- [ ] Implement `reserved_stock` increment on order confirmation
- [ ] Add `deleted_at` column to products and variants for point-in-time queries
- [ ] Set up Supabase Row Level Security as a second layer of defence
- [ ] Configure `app.set("trust proxy", N)` for your exact infrastructure
- [ ] Ship structured logs to an aggregation service (Datadog, Logtail, Axiom)
- [ ] Monitor `/api/v1/health` with an uptime service
- [ ] Add database indexes on `order_items(store_order_id)` — already in schema ✓
