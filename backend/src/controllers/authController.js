const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao realizar login' });
  }
};

const register = async (req, res) => {
  try {
    console.log('Iniciando registro de usuário...');
    const { name, email, password } = req.body;
    console.log('Dados recebidos:', { name, email });

    // Verificar se o usuário já existe
    console.log('Verificando se o email já está cadastrado...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Email já cadastrado:', email);
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Criptografar a senha
    console.log('Criptografando senha...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário
    console.log('Criando novo usuário...');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'FUNCIONARIO'
      }
    });
    console.log('Usuário criado com sucesso:', { id: user.id, name: user.name, email: user.email });

    // Gerar token JWT
    console.log('Gerando token JWT...');
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Registro concluído com sucesso');
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro detalhado no registro:', error);
    res.status(500).json({ 
      message: 'Erro ao cadastrar usuário',
      error: error.message 
    });
  }
};

module.exports = { login, register }; 