const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Criar usuário admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@beachnordeste.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@beachnordeste.com',
        password: adminPassword,
        role: 'ADMIN'
      }
    });

    console.log('Usuário admin criado:', admin);

    // Criar alguns produtos de exemplo
    const products = await Promise.all([
      prisma.product.upsert({
        where: { id: 1 },
        update: {},
        create: {
          name: 'Cerveja',
          description: 'Cerveja gelada',
          category: 'Bebidas',
          purchasePrice: 5.00,
          salePrice: 8.00,
          quantity: 100
        }
      }),
      prisma.product.upsert({
        where: { id: 2 },
        update: {},
        create: {
          name: 'Água',
          description: 'Água mineral',
          category: 'Bebidas',
          purchasePrice: 2.00,
          salePrice: 4.00,
          quantity: 200
        }
      })
    ]);

    console.log('Produtos criados:', products);

  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 