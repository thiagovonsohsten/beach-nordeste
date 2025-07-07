# 🔧 Solução para Plano Gratuito (Sem Shell)

## Problema
No plano gratuito do Render não há acesso ao Shell, mas precisamos corrigir a estrutura da tabela `Sale`.

## Soluções Disponíveis

### ✅ Opção 1: Correção Automática (Recomendada)

**O que fazer:**
1. **Faça commit e push** das alterações para o GitHub
2. **O Render fará deploy automático**
3. **A correção será executada automaticamente** na inicialização do servidor

**Como funciona:**
- O script `corrigir-banco.js` será executado automaticamente
- Apenas em produção (NODE_ENV=production)
- Na primeira inicialização após o deploy

### ✅ Opção 2: Rota de Correção Manual

**Após o deploy, execute via HTTP:**
```bash
curl -X POST https://beach-nordeste-backend.onrender.com/api/fix-database
```

**Ou use Postman/Insomnia:**
- Method: `POST`
- URL: `https://beach-nordeste-backend.onrender.com/api/fix-database`

### ✅ Opção 3: SQL Manual no Console do Banco

**Passos:**
1. **Acesse o Render.com**
2. **Vá para o serviço do banco PostgreSQL**
3. **Clique em "Connect" → "External Database"**
4. **Use as credenciais fornecidas**
5. **Execute o SQL manualmente**

**SQL para executar:**
```sql
-- Adicionar coluna saleDate se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Sale' AND column_name = 'saleDate') THEN
        ALTER TABLE "Sale" ADD COLUMN "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Adicionar coluna sellerName se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Sale' AND column_name = 'sellerName') THEN
        ALTER TABLE "Sale" ADD COLUMN "sellerName" TEXT NOT NULL DEFAULT 'Vendedor';
    END IF;
END $$;

-- Remover coluna total se existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Sale' AND column_name = 'total') THEN
        ALTER TABLE "Sale" DROP COLUMN "total";
    END IF;
END $$;

-- Criar índices se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'Sale' AND indexname = 'Sale_productId_idx') THEN
        CREATE INDEX "Sale_productId_idx" ON "Sale"("productId");
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'Sale' AND indexname = 'Sale_userId_idx') THEN
        CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");
    END IF;
END $$;

-- Limpar dados inconsistentes
DELETE FROM "Sale" WHERE "productId" NOT IN (SELECT "id" FROM "Product");
DELETE FROM "Sale" WHERE "userId" NOT IN (SELECT "id" FROM "User");
```

## 📋 Passo a Passo Recomendado

### 1. Deploy Automático
```bash
# No seu computador local
git add .
git commit -m "Adiciona correção automática do banco"
git push origin main
```

### 2. Aguardar Deploy
- O Render fará deploy automático
- Aguarde alguns minutos
- A correção será executada na inicialização

### 3. Verificar
- Acesse: https://beach-nordeste-frontend.vercel.app
- Faça login: `adrianasohsten@gmail.com` / `ratal2010`
- Teste a página de vendas

### 4. Se ainda houver problemas
- Execute a rota manual: `POST /api/fix-database`
- Ou use o SQL manual no console do banco

## ⚡ Alternativa Rápida

Se quiser uma solução mais rápida, use o **SQL manual** diretamente no console do banco PostgreSQL do Render. É a opção mais direta e não depende de deploy.

## 🎯 Resultado Esperado

Após qualquer uma das soluções:
- ✅ A tabela `Sale` terá a estrutura correta
- ✅ As vendas aparecerão na página
- ✅ Não haverá mais erro 500
- ✅ O sistema funcionará normalmente 