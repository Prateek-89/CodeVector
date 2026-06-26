const { Router } = require('express');
const productController = require('../controllers/productController');

const router = Router();

// GET /api/categories — List all distinct categories
router.get('/', productController.getCategories);

module.exports = router;