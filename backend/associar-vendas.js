const { PrismaClient } = require('@prisma/client');

// Configurar dotenv apenas se não estiver em produção
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function associarVendas() {
  try {
    console.log('🔧 Iniciando associação de vendas aos produtos...');
    console.log('🌍 Ambiente:', process.env.NODE_ENV || 'desenvolvimento');
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Configurada' : 'Não configurada');
    
    // Conectar ao banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    
    // 1. Buscar todas as vendas sem productId
    console.log('\n📋 1. Buscando vendas sem produto associado...');
    
    const vendasSemProduto = await prisma.$queryRaw`
      SELECT id, "totalValue", "paymentMethod", "saleDate", "sellerName"
      FROM "Sale" 
      WHERE "productId" IS NULL
      ORDER BY "saleDate" DESC
    `;
    
    console.log(`📊 Encontradas ${vendasSemProduto.length} vendas sem produto associado`);
    
    if (vendasSemProduto.length === 0) {
      console.log('✅ Todas as vendas já têm produto associado!');
      return;
    }
    
    // 2. Buscar todos os produtos
    console.log('\n📦 2. Buscando produtos disponíveis...');
    
    const produtos = await prisma.$queryRaw`
      SELECT id, name, "salePrice", category
      FROM "Product" 
      ORDER BY "salePrice" ASC
    `;
    
    console.log(`📊 Encontrados ${produtos.length} produtos`);
    produtos.forEach(prod => {
      console.log(`  - ${prod.name}: R$ ${prod.salePrice} (${prod.category})`);
    });
    
    if (produtos.length === 0) {
      console.log('❌ Nenhum produto encontrado! Crie produtos primeiro.');
      return;
    }
    
    // 3. Associar vendas aos produtos baseado no valor
    console.log('\n🔗 3. Associando vendas aos produtos...');
    
    let associacoes = 0;
    let erros = 0;
    
    for (const venda of vendasSemProduto) {
      try {
        // Encontrar o produto mais próximo do valor da venda
        let produtoEscolhido = null;
        let menorDiferenca = Infinity;
        
        for (const produto of produtos) {
          const diferenca = Math.abs(venda.totalValue - produto.salePrice);
          if (diferenca < menorDiferenca) {
            menorDiferenca = diferenca;
            produtoEscolhido = produto;
          }
        }
        
        if (produtoEscolhido) {
          // Calcular quantidade baseada no valor total
          const quantidade = Math.round(venda.totalValue / produtoEscolhido.salePrice);
          const quantidadeFinal = quantidade > 0 ? quantidade : 1;
          
          // Atualizar a venda
          await prisma.$executeRaw`
            UPDATE "Sale" 
            SET "productId" = ${produtoEscolhido.id}, 
                quantity = ${quantidadeFinal}
            WHERE id = ${venda.id}
          `;
          
          console.log(`✅ Venda ${venda.id} (R$ ${venda.totalValue}) → ${produtoEscolhido.name} (${quantidadeFinal}x R$ ${produtoEscolhido.salePrice})`);
          associacoes++;
        } else {
          console.log(`❌ Venda ${venda.id} (R$ ${venda.totalValue}) → Nenhum produto encontrado`);
          erros++;
        }
      } catch (error) {
        console.log(`❌ Erro ao associar venda ${venda.id}:`, error.message);
        erros++;
      }
    }
    
    // 4. Verificar resultado
    console.log('\n📊 4. Resultado da associação:');
    console.log(`✅ Vendas associadas: ${associacoes}`);
    console.log(`❌ Erros: ${erros}`);
    
    // 5. Verificar vendas após associação
    console.log('\n🔍 5. Verificando vendas após associação...');
    
    const vendasComProduto = await prisma.$queryRaw`
      SELECT 
        s.id,
        s."totalValue",
        s.quantity,
        s."paymentMethod",
        s."saleDate",
        p.name as product_name,
        p."salePrice" as product_price,
        p.category as product_category
      FROM "Sale" s
      LEFT JOIN "Product" p ON s."productId" = p.id
      ORDER BY s."saleDate" DESC
      LIMIT 10
    `;
    
    console.log('📋 Últimas 10 vendas:');
    vendasComProduto.forEach(venda => {
      if (venda.product_name) {
        console.log(`  ✅ Venda ${venda.id}: ${venda.quantity}x ${venda.product_name} (R$ ${venda.product_price}) = R$ ${venda.totalValue}`);
      } else {
        console.log(`  ❌ Venda ${venda.id}: Sem produto (R$ ${venda.totalValue})`);
      }
    });
    
    // 6. Estatísticas finais
    const totalVendas = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "Sale"`;
    const vendasComProdutoCount = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "Sale" WHERE "productId" IS NOT NULL`;
    const vendasSemProdutoCount = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "Sale" WHERE "productId" IS NULL`;
    
    console.log('\n📈 6. Estatísticas finais:');
    console.log(`📊 Total de vendas: ${totalVendas[0].total}`);
    console.log(`✅ Vendas com produto: ${vendasComProdutoCount[0].total}`);
    console.log(`❌ Vendas sem produto: ${vendasSemProdutoCount[0].total}`);
    
    console.log('\n🎉 Associação de vendas concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a associação:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  associarVendas();
}

module.exports = { associarVendas }; 