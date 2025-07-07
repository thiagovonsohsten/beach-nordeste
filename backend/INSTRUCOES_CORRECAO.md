# 🔧 Instruções para Corrigir o Banco de Dados

## Problema
A rota `/api/sales` está retornando erro 500 devido a problemas na estrutura da tabela `Sale` no banco de dados.

## Solução

### Opção 1: Script Automático (Recomendado)

1. **Acesse o Render.com**
   - Vá para https://render.com
   - Faça login na sua conta
   - Encontre o serviço `beach-nordeste-api`

2. **Abra o Shell**
   - Clique no serviço `beach-nordeste-api`
   - Vá para a aba "Shell"
   - Clique em "Connect"

3. **Execute o comando de correção**
   ```bash
   npm run corrigir-banco
   ```

4. **Aguarde a conclusão**
   - O script vai mostrar o progresso da correção
   - Você verá mensagens como "✅ Coluna saleDate adicionada"
   - No final deve aparecer "🎉 Correção do banco concluída com sucesso!"

### Opção 2: SQL Manual

Se preferir executar SQL diretamente:

1. **Acesse o console do PostgreSQL no Render**
   - Vá para o serviço do banco de dados
   - Clique em "Connect" → "External Database"
   - Use as credenciais fornecidas

2. **Execute o script SQL**
   - Copie todo o conteúdo do arquivo `corrigir-banco.sql`
   - Cole no console do PostgreSQL
   - Execute o script

### Opção 3: Deploy Automático

O Render fará deploy automático das alterações no código. Após o deploy:

1. **Aguarde alguns minutos** para o deploy completar
2. **Teste a aplicação** acessando a página de vendas
3. **Se ainda houver problemas**, execute o script de correção

## O que o script faz

✅ **Verifica a estrutura** das tabelas  
✅ **Adiciona colunas faltantes** (saleDate, sellerName)  
✅ **Remove colunas obsoletas** (total)  
✅ **Cria índices necessários**  
✅ **Corrige foreign keys**  
✅ **Remove dados inconsistentes** (vendas órfãs)  
✅ **Testa a query** de vendas  

## Verificação

Após executar a correção, teste:

1. **Faça login** no sistema com as credenciais:
   - Email: `adrianasohsten@gmail.com`
   - Senha: `ratal2010`

2. **Acesse a página de vendas** como admin

3. **Verifique se as vendas aparecem** sem erro 500

## Logs de Debug

O script gera logs detalhados que mostram:
- Quais colunas foram adicionadas/removidas
- Quantos dados inconsistentes foram limpos
- Se a query de vendas está funcionando

## Estrutura Correta da Tabela Sale

Após a correção, a tabela deve ter:

```sql
CREATE TABLE "Sale" (
    "id" SERIAL PRIMARY KEY,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL DEFAULT 'Vendedor',
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("productId") REFERENCES "Product"("id"),
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);
```

## Suporte

Se ainda houver problemas após executar a correção:

1. **Verifique os logs** do script de correção
2. **Teste a API diretamente** com curl ou Postman
3. **Verifique se o deploy** foi concluído no Render 