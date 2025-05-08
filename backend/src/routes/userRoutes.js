const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

// Rota para obter dados do usuário atual
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router; 