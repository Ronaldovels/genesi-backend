import express from 'express';
import Account from '../models/Account.js';
import User from '../models/User.js';

const router = express.Router();

// GET: Listar todas as contas de um usuário
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
    }

    const accounts = await Account.find({ user: userId });
    res.json(accounts);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// POST: Criar uma nova conta para um usuário
router.post('/', async (req, res) => {
  try {
    const { userId, name } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ message: 'ID do usuário e nome da conta são obrigatórios.' });
    }

    const user = await User.findById(userId).populate('accounts');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Limita a 2 contas por usuário
    if (user.accounts.length >= 2) {
      return res.status(400).json({ message: 'Limite de 2 contas por usuário atingido.' });
    }

    const newAccount = new Account({ user: userId, name });
    await newAccount.save();

    user.accounts.push(newAccount._id);
    await user.save();

    res.status(201).json(newAccount);
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

export default router;

// =============================================
// IMPORTAÇÕES
// =============================================
// - express: Framework para criação de rotas HTTP.
// - Account: Modelo de conta bancária do usuário.
// - User: Modelo de usuário do sistema.
//
// =============================================
// O QUE O CÓDIGO FAZ
// =============================================
// Este arquivo define as rotas relacionadas às contas dos usuários (Account).
// - Permite listar todas as contas de um usuário (GET /:userId).
// - Permite criar uma nova conta para um usuário, com limite de até 2 contas (POST /).
// Utiliza o modelo Account para persistência e consulta dos dados.
//
// =============================================
// RELAÇÃO COM O FRONTEND
// =============================================
// - O frontend consome essas rotas para exibir as contas do usuário e permitir a criação de novas contas.
// - As respostas dessas rotas alimentam telas de gerenciamento de contas, saldos e movimentações.
// ============================================= 