const prisma = require('../utils/prisma');
const { encodeCursor, decodeCursor } = require('../utils/cursor');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config');

/**
 * Product Service
 *
 * Contains all business logic for product queries and mutations.
 * Controllers call these functions; they never access Prisma directly.
 */

/**
 * Retrieve paginated products with cursor-based pagination.
 *
 * Cursor pagination works by using WHERE conditions on the ORDER BY columns
 * to find the starting point, rather than using OFFSET to skip rows.
 *
 * Query plan (simplified):
 *   SELECT * FROM products
 *   WHERE (updated_at, id) < ($1, $2)  — cursor condition
 *   ORDER BY updated_at DESC, id DESC
 *   LIMIT $3
 *
 * The composite index (updated_at DESC, id DESC) enables an index-only scan:
 * PostgreSQL walks the B-tree leaf nodes in reverse order, stopping after LIMIT rows.
 * This is O(log n) for the initial position seek + O(k) for k returned rows.
 *
 * OFFSET would be O(n) because PostgreSQL must count and discard n rows.
 */
async function getProducts({ limit = config.pagination.defaultLimit, category, cursor } = {}) {
  // Build the WHERE clause dynamically
  const where = {};

  if (category) {
    where.category = category;
  }

  if (cursor) {
    const { id, updatedAt } = decodeCursor(cursor);
    // Cursor condition: fetch rows before (earlier in sort order) the cursor row
    // Using tuple comparison: (updated_at, id) < (cursor_updated_at, cursor_id)
    where.OR = [
      { updatedAt: { lt: updatedAt } },
      {
        updatedAt: { equals: updatedAt },
        id: { lt: id },
      },
    ];
  }

  // Fetch one extra row to determine if there are more pages
  const products = await prisma.product.findMany({
    where,
    orderBy: [
      { updatedAt: 'desc' },
      { id: 'desc' },
    ],
    take: limit + 1,
  });

  // Determine if there are more results and build the next cursor
  const hasMore = products.length > limit;
  if (hasMore) {
    products.pop(); // Remove the extra row
  }

  const nextCursor = hasMore
    ? encodeCursor({
        id: products[products.length - 1].id,
        updatedAt: products[products.length - 1].updatedAt,
      })
    : null;

  return {
    products,
    nextCursor,
    hasMore,
  };
}

/**
 * Get a single product by ID.
 */
async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

/**
 * Update a product's fields.
 * Only provided fields are updated. updatedAt is always refreshed.
 */
async function updateProduct(id, data) {
  // Verify the product exists first (gives us a 404 instead of a cryptic error)
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Product not found', 404);
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(), // Ensure updatedAt is refreshed even if not in payload
    },
  });

  return product;
}

/**
 * Get distinct categories for filter dropdowns.
 */
async function getCategories() {
  const result = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  return result.map((r) => r.category);
}

module.exports = {
  getProducts,
  getProductById,
  updateProduct,
  getCategories,
};