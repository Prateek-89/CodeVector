const { Router } = require('express');
const productController = require('../controllers/productController');

const router = Router();

// GET /api/products — List products with cursor pagination
router.get('/', productController.getProducts);

// GET /api/products/:id — Get a single product
router.get('/:id', productController.getProductById);

// PATCH /api/products/:id — Update a product
router.patch('/:id', productController.updateProduct);

module.exports = router;