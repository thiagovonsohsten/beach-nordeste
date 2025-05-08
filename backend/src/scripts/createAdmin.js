const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Usar variáveis de ambiente para dados sensíveis
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Administrador';

    if (!adminEmail || !adminPassword) {
      console.error('Erro: ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios no arquivo .env');
      return;
    }

    // Verificar se o admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('Usuário administrador já existe!');
      return;
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Criar o usuário admin
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Usuário administrador criado com sucesso!');
    console.log('Email:', adminEmail);
    console.log('IMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 