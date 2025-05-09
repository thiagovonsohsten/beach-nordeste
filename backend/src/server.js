import { app } from './app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Função para testar a conexão com o banco de dados
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

// Iniciar o servidor
app.listen(port, async () => {
  await testDatabaseConnection();
  console.log(`Servidor rodando na porta ${port}`);
}); 