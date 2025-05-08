const express = require('express');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const {
  getFinancialReport,
  getSalesReport,
  getProductReport
} = require('../controllers/reportController');

const router = express.Router();

// Todas as rotas precisam de autenticação e são apenas para admin
router.use(authenticateToken);
router.use(isAdmin);

// Rotas de relatórios
router.get('/financial', getFinancialReport);
router.get('/sales', getSalesReport);
router.get('/products', getProductReport);

module.exports = router; 