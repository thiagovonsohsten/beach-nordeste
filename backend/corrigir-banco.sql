-- Script para corrigir a estrutura da tabela Sale no banco de dados
-- Execute este script no console do PostgreSQL do Render

-- 1. Verificar se a tabela Sale existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Sale') THEN
        RAISE EXCEPTION 'Tabela Sale não existe';
    END IF;
END $$;

-- 2. Verificar e adicionar colunas faltantes
DO $$
BEGIN
    -- Verificar se a coluna saleDate existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Sale' AND column_name = 'saleDate') THEN
        ALTER TABLE "Sale" ADD COLUMN "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Coluna saleDate adicionada';
    ELSE
        RAISE NOTICE 'Coluna saleDate já existe';
    END IF;
    
    -- Verificar se a coluna sellerName existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Sale' AND column_name = 'sellerName') THEN
        ALTER TABLE "Sale" ADD COLUMN "sellerName" TEXT NOT NULL DEFAULT 'Vendedor';
        RAISE NOTICE 'Coluna sellerName adicionada';
    ELSE
        RAISE NOTICE 'Coluna sellerName já existe';
    END IF;
    
    -- Verificar se a coluna total ainda existe (deve ter sido removida)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Sale' AND column_name = 'total') THEN
        ALTER TABLE "Sale" DROP COLUMN "total";
        RAISE NOTICE 'Coluna total removida';
    ELSE
        RAISE NOTICE 'Coluna total já foi removida';
    END IF;
END $$;

-- 3. Verificar e criar índices
DO $$
BEGIN
    -- Índice para productId
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'Sale' AND indexname = 'Sale_productId_idx') THEN
        CREATE INDEX "Sale_productId_idx" ON "Sale"("productId");
        RAISE NOTICE 'Índice Sale_productId_idx criado';
    ELSE
        RAISE NOTICE 'Índice Sale_productId_idx já existe';
    END IF;
    
    -- Índice para userId
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'Sale' AND indexname = 'Sale_userId_idx') THEN
        CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");
        RAISE NOTICE 'Índice Sale_userId_idx criado';
    ELSE
        RAISE NOTICE 'Índice Sale_userId_idx já existe';
    END IF;
END $$;

-- 4. Verificar e corrigir foreign keys
DO $$
BEGIN
    -- Verificar foreign key para Product
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'Sale_productId_fkey' AND table_name = 'Sale'
    ) THEN
        ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE 'Foreign key Sale_productId_fkey criada';
    ELSE
        RAISE NOTICE 'Foreign key Sale_productId_fkey já existe';
    END IF;
    
    -- Verificar foreign key para User
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'Sale_userId_fkey' AND table_name = 'Sale'
    ) THEN
        ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE 'Foreign key Sale_userId_fkey criada';
    ELSE
        RAISE NOTICE 'Foreign key Sale_userId_fkey já existe';
    END IF;
END $$;

-- 5. Limpar dados inconsistentes
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Remover vendas com produtos inexistentes
    SELECT COUNT(*) INTO orphan_count FROM "Sale" 
    WHERE "productId" NOT IN (SELECT "id" FROM "Product");
    
    IF orphan_count > 0 THEN
        DELETE FROM "Sale" WHERE "productId" NOT IN (SELECT "id" FROM "Product");
        RAISE NOTICE 'Removidas % vendas com produtos inexistentes', orphan_count;
    ELSE
        RAISE NOTICE 'Nenhuma venda com produto inexistente encontrada';
    END IF;
    
    -- Remover vendas com usuários inexistentes
    SELECT COUNT(*) INTO orphan_count FROM "Sale" 
    WHERE "userId" NOT IN (SELECT "id" FROM "User");
    
    IF orphan_count > 0 THEN
        DELETE FROM "Sale" WHERE "userId" NOT IN (SELECT "id" FROM "User");
        RAISE NOTICE 'Removidas % vendas com usuários inexistentes', orphan_count;
    ELSE
        RAISE NOTICE 'Nenhuma venda com usuário inexistente encontrada';
    END IF;
END $$;

-- 6. Verificar estrutura final
SELECT 
    'ESTRUTURA FINAL DA TABELA SALE' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'Sale' 
ORDER BY ordinal_position;

-- 7. Verificar índices
SELECT 
    'ÍNDICES DA TABELA SALE' as info;

SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'Sale';

-- 8. Verificar foreign keys
SELECT 
    'FOREIGN KEYS DA TABELA SALE' as info;

SELECT 
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='Sale';

-- 9. Testar query de vendas
SELECT 
    'TESTE DE QUERY DE VENDAS' as info;

SELECT COUNT(*) as total_vendas FROM "Sale";

-- 10. Verificar dados de exemplo
SELECT 
    'DADOS DE EXEMPLO' as info;

SELECT 
    s.id,
    s."productId",
    s."userId",
    s.quantity,
    s."paymentMethod",
    s."sellerName",
    s."saleDate",
    p.name as product_name,
    u.name as user_name
FROM "Sale" s
LEFT JOIN "Product" p ON s."productId" = p.id
LEFT JOIN "User" u ON s."userId" = u.id
LIMIT 5; 