const productService = require('../services/productService');
const { getProductsSchema, updateProductSchema } = require('../utils/validation');

/**
 * Product Controller
 *
 * Thin layer that handles HTTP request/response concerns.
 * All business logic is delegated to the service layer.
 */

/**
 * GET /products
 * Query params: limit, category, cursor
 */
async function getProducts(req, res, next) {
  try {
    // Validate and parse query parameters
    const query = getProductsSchema.parse(req.query);

    const result = await productService.getProducts({
      limit: query.limit,
      category: query.category,
      cursor: query.cursor,
    });

    res.json({
      data: result.products,
      pagination: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /products/:id
 */
async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /products/:id
 * Body: { name?, category?, price? }
 */
async function updateProduct(req, res, next) {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id, data);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /categories
 */
async function getCategories(req, res, next) {
  try {
    const categories = await productService.getCategories();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProductById,
  updateProduct,
  getCategories,
};