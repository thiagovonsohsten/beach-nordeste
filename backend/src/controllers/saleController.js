const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar uma nova venda
const createSale = async (req, res) => {
  try {
    const { productId, quantity, paymentMethod } = req.body;
    const userId = req.user.id;

    // Buscar o produto
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Quantidade insuficiente em estoque' });
    }

    // Criar a venda
    const sale = await prisma.sale.create({
      data: {
        productId,
        quantity,
        paymentMethod,
        userId,
        sellerName: req.user.name
      }
    });

    // Atualizar o estoque
    await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: product.quantity - quantity
      }
    });

    // Buscar a venda criada com os dados completos
    const saleWithDetails = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(saleWithDetails);
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ message: 'Erro ao criar venda' });
  }
};

// Listar todas as vendas
const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        saleDate: 'desc'
      }
    });

    res.json(sales);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ message: 'Erro ao buscar vendas' });
  }
};

// Buscar venda por ID
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ message: 'Erro ao buscar venda' });
  }
};

// Buscar vendas por data
const getSalesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        saleDate: 'desc'
      }
    });

    res.json(sales);
  } catch (error) {
    console.error('Erro ao buscar vendas por data:', error);
    res.status(500).json({ message: 'Erro ao buscar vendas por data' });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  getSalesByDate
}; 