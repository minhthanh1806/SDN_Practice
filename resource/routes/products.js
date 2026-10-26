const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const productController = require('../controllers/productController');

// All product endpoints require valid JWT
router.use(authMiddleware);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
