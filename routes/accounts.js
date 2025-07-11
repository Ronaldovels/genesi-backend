import express from 'express';
import Account from '../models/Account.js';

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

// ALTERADO: Rota para criar contas subsequentes
router.post('/', async (req, res) => {
   const { userId } = req.body; // Apenas userId é necessário no corpo da requisição

  if (!userId) {
    return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
  }

  try {
    const userAccounts = await Account.find({ user: userId });

    if (userAccounts.length >= 10) {
      return res.status(400).json({ message: 'Limite de 10 contas por usuário atingido.' });
    }

    const highestIndex = Math.max(...userAccounts.map(acc => acc.accountIndex));
    const nextIndex = highestIndex + 1;
    
    // Define o nome automaticamente
    const newAccountName = `Conta #${nextIndex}`;

    const newAccount = new Account({
      user: userId,
      name: newAccountName,
      accountIndex: nextIndex
    });

    await newAccount.save();
    res.status(201).json(newAccount);

  } catch (error) {
    console.error("Erro ao criar nova conta:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// NOVO: Rota para ATUALIZAR o nome de uma conta
router.put('/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'O novo nome é obrigatório.' });
  }

  try {
    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      { name: name },
      { new: true } // Retorna o documento atualizado
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: 'Conta não encontrada.' });
    }

    res.json(updatedAccount);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


// NOVO: Buscar conta por userId + name OU userId + accountIndex
import User from '../models/User.js'; 

router.post('/find', async (req, res) => {
  const { user, name, accountIndex } = req.body;
  if (!user) {
    return res.status(400).json({ message: 'ID do usuário (whatsapp) é obrigatório.' });
  }

  // 1. Busca o usuário pelo WhatsApp
  const userDoc = await User.findOne({ whatsapp: user });
  if (!userDoc) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  // 2. Monta a query da conta usando o _id do usuário
  let query = { user: userDoc._id };
  if (name) query.name = new RegExp(`^${name}$`, 'i');
  if (accountIndex) query.accountIndex = accountIndex;

  try {
    const account = await Account.findOne(query);
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada.' });
    }
    res.json(account);
  } catch (error) {
    console.error("Erro ao buscar conta:", error);
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