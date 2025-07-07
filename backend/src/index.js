require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { corrigirBanco } = require('../corrigir-banco');

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://beach-nordeste.vercel.app',
    'https://beach-nordeste-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Rotas
app.use('/api', routes);

// Rota padrão
app.get('/', (req, res) => {
  res.json({ message: 'API da Beach Nordeste' });
});

// Função para inicializar o servidor
async function startServer() {
  try {
    // Corrigir banco de dados na inicialização (apenas em produção)
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Iniciando correção automática do banco...');
      await corrigirBanco();
      console.log('✅ Correção do banco concluída');
    }
    
    // Iniciar servidor
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer(); 