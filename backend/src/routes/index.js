const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const saleRoutes = require('./saleRoutes');
const reportRoutes = require('./reportRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/reports', reportRoutes);

// Rota para correção manual do banco (apenas em produção)
if (process.env.NODE_ENV === 'production') {
  router.post('/fix-database', async (req, res) => {
    try {
      const { corrigirBanco } = require('../../corrigir-banco');
      console.log('🔧 Iniciando correção manual do banco...');
      await corrigirBanco();
      console.log('✅ Correção manual do banco concluída');
      res.json({ 
        success: true, 
        message: 'Banco de dados corrigido com sucesso!' 
      });
    } catch (error) {
      console.error('❌ Erro na correção manual:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao corrigir banco de dados',
        error: error.message 
      });
    }
  });

  // Rota para associar vendas aos produtos
  router.post('/associate-sales', async (req, res) => {
    try {
      const { associarVendas } = require('../../associar-vendas');
      console.log('🔧 Iniciando associação de vendas...');
      await associarVendas();
      console.log('✅ Associação de vendas concluída');
      res.json({ 
        success: true, 
        message: 'Vendas associadas aos produtos com sucesso!' 
      });
    } catch (error) {
      console.error('❌ Erro na associação:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao associar vendas',
        error: error.message 
      });
    }
  });
}

module.exports = router; 