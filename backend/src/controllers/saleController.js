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
    // Usar query SQL direta para evitar problemas com campos NULL
    const sales = await prisma.$queryRaw`
      SELECT 
        s.id,
        s."productId",
        s."userId",
        s.quantity,
        s."paymentMethod",
        s."sellerName",
        s."saleDate",
        s."totalValue",
        s."createdAt",
        s."updatedAt",
        p.id as "product.id",
        p.name as "product.name",
        p."salePrice" as "product.salePrice",
        p."purchasePrice" as "product.purchasePrice",
        p.category as "product.category",
        u.id as "user.id",
        u.name as "user.name",
        u.email as "user.email"
      FROM "Sale" s
      LEFT JOIN "Product" p ON s."productId" = p.id
      LEFT JOIN "User" u ON s."userId" = u.id
      ORDER BY s."saleDate" DESC
    `;

    // Transformar o resultado para o formato esperado pelo frontend
    const formattedSales = sales.map(sale => ({
      id: sale.id,
      productId: sale.productId,
      userId: sale.userId,
      quantity: sale.quantity,
      paymentMethod: sale.paymentMethod,
      sellerName: sale.sellerName,
      saleDate: sale.saleDate,
      totalValue: sale.totalValue,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      product: sale["product.id"] ? {
        id: sale["product.id"],
        name: sale["product.name"],
        salePrice: sale["product.salePrice"],
        purchasePrice: sale["product.purchasePrice"],
        category: sale["product.category"]
      } : null,
      user: sale["user.id"] ? {
        id: sale["user.id"],
        name: sale["user.name"],
        email: sale["user.email"]
      } : null
    }));

    res.json(formattedSales);
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