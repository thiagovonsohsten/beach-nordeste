const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/productController');

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Rotas públicas (para usuários autenticados)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rotas protegidas (apenas admin)
router.post('/', isAdmin, createProduct);
router.put('/:id', isAdmin, updateProduct);
router.delete('/:id', isAdmin, deleteProduct);
router.patch('/:id/stock', isAdmin, updateStock);

module.exports = router; 