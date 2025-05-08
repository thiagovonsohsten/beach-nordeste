const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Relatório financeiro
const getFinancialReport = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        product: true
      },
      orderBy: {
        saleDate: 'desc'
      }
    });

    // Calcular totais
    const totalSales = sales.reduce((acc, sale) => acc + (sale.product.salePrice * sale.quantity), 0);
    const totalProducts = sales.reduce((acc, sale) => acc + sale.quantity, 0);
    const totalProfit = sales.reduce((acc, sale) => {
      const profit = (sale.product.salePrice * sale.quantity) - (sale.product.purchasePrice * sale.quantity);
      return acc + profit;
    }, 0);

    res.json({
      sales,
      summary: {
        totalSales,
        totalProducts,
        totalProfit
      }
    });
  } catch (error) {
    console.error('Erro ao buscar relatório financeiro:', error);
    res.status(500).json({ message: 'Erro ao buscar relatório financeiro' });
  }
};

// Relatório de vendas
const getSalesReport = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        saleDate: 'desc'
      }
    });

    // Agrupar vendas por vendedor
    const salesBySeller = sales.reduce((acc, sale) => {
      const sellerName = sale.sellerName;
      if (!acc[sellerName]) {
        acc[sellerName] = {
          totalSales: 0,
          totalProducts: 0,
          totalValue: 0
        };
      }
      acc[sellerName].totalSales++;
      acc[sellerName].totalProducts += sale.quantity;
      acc[sellerName].totalValue += sale.product.salePrice * sale.quantity;
      return acc;
    }, {});

    res.json({
      sales,
      summary: {
        totalSales: sales.length,
        totalProducts: sales.reduce((acc, sale) => acc + sale.quantity, 0),
        totalValue: sales.reduce((acc, sale) => acc + (sale.product.salePrice * sale.quantity), 0),
        salesBySeller
      }
    });
  } catch (error) {
    console.error('Erro ao buscar relatório de vendas:', error);
    res.status(500).json({ message: 'Erro ao buscar relatório de vendas' });
  }
};

// Relatório de produtos
const getProductReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        sales: true
      }
    });

    // Calcular estatísticas por produto
    const productStats = products.map(product => {
      const totalSold = product.sales.reduce((acc, sale) => acc + sale.quantity, 0);
      const totalRevenue = product.sales.reduce((acc, sale) => acc + (product.salePrice * sale.quantity), 0);
      const totalProfit = product.sales.reduce((acc, sale) => {
        const profit = (product.salePrice * sale.quantity) - (product.purchasePrice * sale.quantity);
        return acc + profit;
      }, 0);

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        currentStock: product.quantity,
        totalSold,
        totalRevenue,
        totalProfit
      };
    });

    res.json({
      products: productStats,
      summary: {
        totalProducts: products.length,
        totalStock: products.reduce((acc, product) => acc + product.quantity, 0),
        totalSold: products.reduce((acc, product) => acc + product.sales.reduce((sum, sale) => sum + sale.quantity, 0), 0),
        totalRevenue: products.reduce((acc, product) => acc + product.sales.reduce((sum, sale) => sum + (product.salePrice * sale.quantity), 0), 0)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar relatório de produtos:', error);
    res.status(500).json({ message: 'Erro ao buscar relatório de produtos' });
  }
};

module.exports = {
  getFinancialReport,
  getSalesReport,
  getProductReport
}; 