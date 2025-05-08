const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os produtos
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

// Buscar produto por ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};

// Criar novo produto
const createProduct = async (req, res) => {
  try {
    const { name, description, category, purchasePrice, salePrice, quantity } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        purchasePrice: parseFloat(purchasePrice),
        salePrice: parseFloat(salePrice),
        quantity: parseInt(quantity)
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

// Atualizar produto
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, purchasePrice, salePrice, quantity } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        purchasePrice: parseFloat(purchasePrice),
        salePrice: parseFloat(salePrice),
        quantity: parseInt(quantity)
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
};

// Deletar produto
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verificar se o produto tem vendas associadas
    const sales = await prisma.sale.findMany({
      where: { productId: parseInt(id) }
    });

    if (sales.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível deletar este produto pois existem vendas associadas a ele' 
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro ao deletar produto' });
  }
};

// Atualizar quantidade do estoque
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body; // operation: 'add' ou 'remove'

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    let newQuantity = product.quantity;
    if (operation === 'add') {
      newQuantity += parseInt(quantity);
    } else if (operation === 'remove') {
      newQuantity -= parseInt(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({ message: 'Quantidade insuficiente em estoque' });
      }
    } else {
      return res.status(400).json({ message: 'Operação inválida' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { quantity: newQuantity }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({ message: 'Erro ao atualizar estoque' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
}; 