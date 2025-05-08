# Beach Nordeste - Backend

Backend do sistema de gerenciamento da loja Beach Nordeste.

## Tecnologias

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Bcrypt para criptografia

## Requisitos

- Node.js (v14 ou superior)
- PostgreSQL
- npm ou yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env` com suas credenciais do banco de dados:
```
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/beach_nordeste"
JWT_SECRET="sua_chave_secreta"
PORT=3000
```

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

5. Execute o seed para criar dados iniciais:
```bash
npx prisma db seed
```

## Executando o projeto

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Endpoints da API

### Autenticação
- POST /api/auth/login - Login de usuário

### Produtos
- GET /api/products - Lista todos os produtos
- GET /api/products/:id - Busca produto por ID
- POST /api/products - Cria novo produto (ADMIN)
- PUT /api/products/:id - Atualiza produto (ADMIN)
- DELETE /api/products/:id - Deleta produto (ADMIN)

### Vendas
- POST /api/sales - Registra nova venda
- GET /api/sales/report - Gera relatório financeiro

## Dados iniciais

Um usuário admin é criado automaticamente:
- Email: admin@beach.com
- Senha: admin123

## Licença

MIT 