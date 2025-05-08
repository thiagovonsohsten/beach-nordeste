const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const {
  createSale,
  getSales,
  getSaleById,
  getSalesByDate
} = require('../controllers/saleController');

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Rotas de vendas
router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.get('/date/:date', getSalesByDate);

module.exports = router; 