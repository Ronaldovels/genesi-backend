import express from 'express';
import User from '../models/User.js';
import Account from '../models/Account.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Category from '../models/Category.js';
import AccountCategory from '../models/AccountCategory.js';

const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, whatsapp } = req.body;
    if (!name || !email || !password || !whatsapp) {
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }
    const userExists = await User.findOne({ $or: [{ email }, { whatsapp }] });
    if (userExists) {
      return res.status(400).json({ message: 'Email ou WhatsApp já cadastrado.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const categoriasPadrao = [
      "Alimentação",
      "Casa",
      "Transporte",
      "Lazer",
      "Mercado",
      "Cuidados pessoais",
      "Despesas médicas",
      "Educação",
      "Família",
      "Pets",
      "Prestador de serviço"
    ];
    const newUser = new User({ name, email, password: hashedPassword, whatsapp, categories: categoriasPadrao });
    await newUser.save();

    const newAccount = new Account({
      user: newUser._id,
      name: 'Conta Principal',
      accountIndex: 1 // ADICIONADO: Define o índice da primeira conta
    });
    await newAccount.save();

    newUser.accounts.push(newAccount._id);
    await newUser.save();

    // Buscar todas as categorias padrão
    const allCategories = await Category.find({});

    // Criar a associação (AccountCategory) para cada categoria padrão
    for (const category of allCategories) {
      const newAccountCategory = new AccountCategory({
        user: newUser._id, // <-- ADICIONE O ID DO USUÁRIO AQUI
        category: category._id,
        limit: 0,
        total_gasto: 0
      });
      await newAccountCategory.save();
    }

    res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: newUser._id });
  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou senha incorretos.' });
    }
    const isMatch = await bcrypt.compare(senha, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou senha incorretos.' });
    }

    // Gerar o Token
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET || 'fallbackSecret',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: { id: user._id, name: user.name, email: user.email, whatsapp: user.whatsapp }
    });

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

export default router;

// =============================================
// IMPORTAÇÕES
// =============================================
// - express: Framework para criação de rotas HTTP.
// - User: Modelo de usuário do sistema.
// - Account: Modelo de conta bancária do usuário.
// - bcrypt: Biblioteca para hash de senhas.
// - jwt: Biblioteca para geração de tokens JWT.
// - Category: Modelo de categoria de gastos.
// - AccountCategory: Modelo de relação usuário-categoria.
//
// =============================================
// O QUE O CÓDIGO FAZ
// =============================================
// Este arquivo define as rotas de autenticação e registro de usuários.
// - Permite registrar novos usuários (POST /register), incluindo criação de conta principal e categorias padrão.
// - Permite login de usuários (POST /login), gerando token JWT para autenticação.
//
// =============================================
// RELAÇÃO COM O FRONTEND
// =============================================
// - O frontend consome essas rotas para registrar novos usuários e realizar login.
// - O token JWT retornado é utilizado pelo frontend para autenticação nas demais rotas protegidas.
// - Essencial para o fluxo de cadastro, login e controle de sessão do usuário.
// ============================================= 