const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('Iniciando limpeza do banco de dados...');

    // Deletar dados em ordem para respeitar as constraints
    await prisma.sale.deleteMany({});
    console.log('Vendas deletadas');

    await prisma.product.deleteMany({});
    console.log('Produtos deletados');

    // Deletar todos os usuários, incluindo o admin
    await prisma.user.deleteMany({});
    console.log('Todos os usuários deletados (incluindo admin)');

    console.log('Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase(); 