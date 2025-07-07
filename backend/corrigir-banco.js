const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function corrigirBanco() {
  try {
    console.log('🔧 Iniciando correção do banco de dados...');
    
    // Conectar ao banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    
    // 1. Verificar se as tabelas existem
    console.log('\n📋 1. Verificando estrutura das tabelas...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Product', 'Sale')
      ORDER BY table_name
    `;
    
    console.log('Tabelas encontradas:', tables.map(t => t.table_name));
    
    // 2. Verificar estrutura da tabela Sale
    console.log('\n🔍 2. Verificando estrutura da tabela Sale...');
    
    const saleColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Sale' 
      ORDER BY ordinal_position
    `;
    
    console.log('Colunas da tabela Sale:');
    saleColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 3. Verificar se as colunas necessárias existem
    console.log('\n🔧 3. Verificando colunas necessárias...');
    
    const hasSaleDate = saleColumns.some(col => col.column_name === 'saleDate');
    const hasSellerName = saleColumns.some(col => col.column_name === 'sellerName');
    const hasTotal = saleColumns.some(col => col.column_name === 'total');
    
    if (!hasSaleDate) {
      console.log('➕ Adicionando coluna saleDate...');
      await prisma.$executeRaw`ALTER TABLE "Sale" ADD COLUMN "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`;
      console.log('✅ Coluna saleDate adicionada');
    } else {
      console.log('✅ Coluna saleDate já existe');
    }
    
    if (!hasSellerName) {
      console.log('➕ Adicionando coluna sellerName...');
      await prisma.$executeRaw`ALTER TABLE "Sale" ADD COLUMN "sellerName" TEXT NOT NULL DEFAULT 'Vendedor'`;
      console.log('✅ Coluna sellerName adicionada');
    } else {
      console.log('✅ Coluna sellerName já existe');
    }
    
    if (hasTotal) {
      console.log('➖ Removendo coluna total...');
      await prisma.$executeRaw`ALTER TABLE "Sale" DROP COLUMN "total"`;
      console.log('✅ Coluna total removida');
    } else {
      console.log('✅ Coluna total já foi removida');
    }
    
    // 4. Verificar e criar índices
    console.log('\n📊 4. Verificando índices...');
    
    const indexes = await prisma.$queryRaw`
      SELECT indexname FROM pg_indexes WHERE tablename = 'Sale'
    `;
    
    const indexNames = indexes.map(idx => idx.indexname);
    
    if (!indexNames.includes('Sale_productId_idx')) {
      console.log('➕ Criando índice Sale_productId_idx...');
      await prisma.$executeRaw`CREATE INDEX "Sale_productId_idx" ON "Sale"("productId")`;
      console.log('✅ Índice Sale_productId_idx criado');
    } else {
      console.log('✅ Índice Sale_productId_idx já existe');
    }
    
    if (!indexNames.includes('Sale_userId_idx')) {
      console.log('➕ Criando índice Sale_userId_idx...');
      await prisma.$executeRaw`CREATE INDEX "Sale_userId_idx" ON "Sale"("userId")`;
      console.log('✅ Índice Sale_userId_idx criado');
    } else {
      console.log('✅ Índice Sale_userId_idx já existe');
    }
    
    // 5. Verificar foreign keys
    console.log('\n🔗 5. Verificando foreign keys...');
    
    const foreignKeys = await prisma.$queryRaw`
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'Sale'
    `;
    
    const fkNames = foreignKeys.map(fk => fk.constraint_name);
    
    if (!fkNames.includes('Sale_productId_fkey')) {
      console.log('➕ Criando foreign key Sale_productId_fkey...');
      await prisma.$executeRaw`
        ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `;
      console.log('✅ Foreign key Sale_productId_fkey criada');
    } else {
      console.log('✅ Foreign key Sale_productId_fkey já existe');
    }
    
    if (!fkNames.includes('Sale_userId_fkey')) {
      console.log('➕ Criando foreign key Sale_userId_fkey...');
      await prisma.$executeRaw`
        ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `;
      console.log('✅ Foreign key Sale_userId_fkey criada');
    } else {
      console.log('✅ Foreign key Sale_userId_fkey já existe');
    }
    
    // 6. Limpar dados inconsistentes
    console.log('\n🧹 6. Limpando dados inconsistentes...');
    
    const orphanSales = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Sale" 
      WHERE "productId" NOT IN (SELECT "id" FROM "Product")
    `;
    
    if (orphanSales[0].count > 0) {
      console.log(`🗑️ Removendo ${orphanSales[0].count} vendas com produtos inexistentes...`);
      await prisma.$executeRaw`
        DELETE FROM "Sale" WHERE "productId" NOT IN (SELECT "id" FROM "Product")
      `;
      console.log('✅ Vendas com produtos inexistentes removidas');
    } else {
      console.log('✅ Nenhuma venda com produto inexistente encontrada');
    }
    
    const orphanUserSales = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Sale" 
      WHERE "userId" NOT IN (SELECT "id" FROM "User")
    `;
    
    if (orphanUserSales[0].count > 0) {
      console.log(`🗑️ Removendo ${orphanUserSales[0].count} vendas com usuários inexistentes...`);
      await prisma.$executeRaw`
        DELETE FROM "Sale" WHERE "userId" NOT IN (SELECT "id" FROM "User")
      `;
      console.log('✅ Vendas com usuários inexistentes removidas');
    } else {
      console.log('✅ Nenhuma venda com usuário inexistente encontrada');
    }
    
    // 7. Testar query de vendas
    console.log('\n🧪 7. Testando query de vendas...');
    
    const salesCount = await prisma.sale.count();
    console.log(`📊 Total de vendas válidas: ${salesCount}`);
    
    if (salesCount > 0) {
      console.log('🔍 Testando query com relacionamentos...');
      
      const testSales = await prisma.sale.findMany({
        take: 1,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              salePrice: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      console.log('✅ Query com relacionamentos funcionando!');
      console.log('📋 Primeira venda:', JSON.stringify(testSales[0], null, 2));
    } else {
      console.log('ℹ️ Nenhuma venda encontrada para teste');
    }
    
    console.log('\n🎉 Correção do banco concluída com sucesso!');
    console.log('✅ A tabela Sale agora está com a estrutura correta');
    console.log('✅ As vendas devem aparecer normalmente no sistema');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  corrigirBanco();
}

module.exports = { corrigirBanco }; 