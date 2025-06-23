import express from 'express';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import AccountCategory from '../models/AccountCategory.js';

const router = express.Router();

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo define as rotas de webhook, geralmente utilizadas para integrações externas (ex: N8N, bots, automações).
//
// O que ele faz:
// - Permite registrar transações automaticamente via integrações externas (ex: POST /transaction).
// - Permite consultar saldo, registrar gastos por categoria, consultar limites e gastos, etc, via integrações.
// - Facilita automações e integrações com outros sistemas, como WhatsApp, bots, etc.
//
// Conexão com o frontend:
// - O frontend normalmente não consome diretamente essas rotas, mas pode se beneficiar de dados atualizados por integrações.
// - Essencial para automações, notificações e integrações externas que impactam o fluxo de dados do usuário.
// =============================================

// Rota única para receber transações do N8N
router.post('/transaction', async (req, res) => {
  try {
    const { whatsapp, type, value, description } = req.body;

    if (!whatsapp || !type || !value) {
      return res.status(400).json({ message: 'WhatsApp, tipo e valor são obrigatórios.' });
    }

    // 1. Encontrar o usuário pelo WhatsApp
    const user = await User.findOne({ whatsapp });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Encontrar a primeira conta (principal) do usuário
    if (user.accounts.length === 0) {
      return res.status(404).json({ message: 'Usuário não possui contas.' });
    }
    const accountId = user.accounts[0]; // Pega a primeira conta como padrão

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Conta principal não encontrada.' });
    }

    // 3. Criar a transação
    const transaction = new Transaction({
      account: accountId,
      type,
      value,
      description: description || `Transação via N8N - ${type}`
    });
    await transaction.save();
    
    // 4. Atualizar o saldo da conta
    const amount = type === 'entrada' ? value : -value;
    account.balance += amount;
    await account.save();

    res.status(201).json({ message: 'Transação registrada com sucesso!', transaction });

  } catch (error) {
    console.error("Erro no webhook de transação:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// GET: Consultar saldo pelo número do WhatsApp
router.get('/balance/:whatsapp', async (req, res) => {
  try {
    const { whatsapp } = req.params;

    if (!whatsapp) {
      return res.status(400).json({ message: 'WhatsApp é obrigatório.' });
    }

    // 1. Encontrar o usuário pelo WhatsApp
    const user = await User.findOne({ whatsapp });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Encontrar a primeira conta (principal) do usuário
    if (user.accounts.length === 0) {
      return res.status(404).json({ message: 'Usuário não possui contas.' });
    }
    const accountId = user.accounts[0]; // Pega a primeira conta como padrão

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Conta principal não encontrada.' });
    }

    // 3. Retornar o saldo da conta
    res.json({
      accountName: account.name,
      balance: account.balance
    });

  } catch (error) {
    console.error("Erro ao consultar saldo via webhook:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota renomeada e ajustada para registrar uma saida
router.post('/saida-categoria', async (req, res) => {
  try {
    const { whatsapp, categoryName, value, description } = req.body;

    if (!whatsapp || !categoryName || !value) {
      return res.status(400).json({ message: 'WhatsApp, nome da categoria e valor são obrigatórios.' });
    }

    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    if (user.accounts.length === 0) return res.status(404).json({ message: 'Nenhuma conta encontrada para o usuário.' });

    const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
    if (!category) return res.status(404).json({ message: `Categoria '${categoryName}' não encontrada.` });

    const accountCategory = await AccountCategory.findOne({ user: user._id, category: category._id });
    if (!accountCategory) return res.status(404).json({ message: `Usuário não possui a categoria '${categoryName}'.` });

    const transaction = new Transaction({
      account: user.accounts[0],
      type: 'saida',
      value,
      description: description || categoryName,
      category: accountCategory._id
    });
    await transaction.save();
    
    const account = await Account.findById(user.accounts[0]);
    if(account) {
        account.balance -= value;
        await account.save();
    }
    
    res.status(201).json({ 
      message: 'Gasto registrado com sucesso!', 
      categoryName,
      transaction 
    });

  } catch (error) {
    console.error("Erro no webhook de saida por categoria:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// POST: Consultar o limite de uma categoria
router.post('/limite-categoria', async (req, res) => {
  try {
    const { whatsapp, categoryName } = req.body;

    if (!whatsapp || !categoryName) {
      return res.status(400).json({ message: 'WhatsApp e nome da categoria são obrigatórios.' });
    }

    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
    if (!category) return res.status(404).json({ message: `Categoria '${categoryName}' não encontrada.` });
    
    const accountCategory = await AccountCategory.findOne({ user: user._id, category: category._id });
    if (!accountCategory) return res.status(404).json({ message: `Usuário não possui a categoria '${categoryName}'.` });

    res.json({ 
      limit: accountCategory.limit || 0,
      categoryName
    });

  } catch (error) {
    console.error("Erro ao consultar limite de categoria:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// POST: Consultar o total gasto em uma categoria no mês atual
router.post('/gasto-categoria', async (req, res) => {
  try {
    const { whatsapp, categoryName } = req.body;
    if (!whatsapp || !categoryName) {
      return res.status(400).json({ message: 'WhatsApp e nome da categoria são obrigatórios.' });
    }

    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    if (user.accounts.length === 0) return res.status(404).json({ message: 'Nenhuma conta encontrada para o usuário.' });

    const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
    if (!category) return res.status(404).json({ message: `Categoria '${categoryName}' não encontrada.` });

    const accountCategory = await AccountCategory.findOne({ user: user._id, category: category._id });
    if (!accountCategory) return res.status(404).json({ message: `Usuário não possui a categoria '${categoryName}'.` });
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await Transaction.aggregate([
      { $match: { 
          account: user.accounts[0], 
          category: accountCategory._id,
          type: 'saida',
          date: { $gte: startOfMonth, $lte: endOfMonth }
      }},
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);

    const totalSpent = result.length > 0 ? result[0].total : 0;
    res.json({ 
      totalSpent,
      categoryName
    });

  } catch (error) {
    console.error("Erro ao consultar gasto da categoria:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// POST: Verificar se o limite da categoria foi ultrapassado
router.post('/ultrapassou-limite', async (req, res) => {
  try {
    const { whatsapp, categoryName } = req.body;
    if (!whatsapp || !categoryName) {
      return res.status(400).json({ message: 'WhatsApp e nome da categoria são obrigatórios.' });
    }

    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    
    const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
    if (!category) return res.status(404).json({ message: `Categoria '${categoryName}' não encontrada.` });
    
    const accountCategory = await AccountCategory.findOne({ user: user._id, category: category._id });
    if (!accountCategory) return res.status(404).json({ message: `Usuário não possui a categoria '${categoryName}'.` });

    const limit = accountCategory.limit || 0;
    if (limit === 0) {
      return res.json({ limitExceeded: false, message: 'Nenhum limite definido para esta categoria.' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await Transaction.aggregate([
        { $match: { account: user.accounts[0], category: accountCategory._id, type: 'saida', date: { $gte: startOfMonth, $lte: endOfMonth } }},
        { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    const totalSpent = result.length > 0 ? result[0].total : 0;
    
    const limitExceeded = totalSpent > limit;
    
    res.json({ 
      limitExceeded, 
      totalSpent, 
      limit,
      categoryName
    });

  } catch (error) {
    console.error("Erro ao verificar se limite foi ultrapassado:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// POST: Definir um limite de gasto para uma categoria
router.post('/define-limit', async (req, res) => {
  try {
    const { whatsapp, categoryName, limitValue } = req.body;

    if (!whatsapp || !categoryName || !limitValue) {
      return res.status(400).json({ message: 'WhatsApp, nome da categoria e valor do limite são obrigatórios.' });
    }

    // 1. Encontrar o usuário
    const user = await User.findOne({ whatsapp });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Encontrar a categoria global
    const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
    if (!category) {
      return res.status(404).json({ message: `Categoria '${categoryName}' não encontrada.` });
    }

    // 3. Encontrar ou criar a associação entre o usuário e a categoria
    let accountCategory = await AccountCategory.findOne({ user: user._id, category: category._id });
    if (!accountCategory) {
      accountCategory = new AccountCategory({
        user: user._id,
        category: category._id,
      });
    }

    // 4. Definir o limite de gastos
    accountCategory.limit = limitValue;
    await accountCategory.save();
    
    res.status(200).json({ 
      message: `Limite para a categoria '${categoryName}' definido para R$ ${limitValue} com sucesso!`,
      categoryName,
      accountCategory
    });

  } catch (error) {
    console.error("Erro no webhook para definir limite:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

export default router;

// =============================================
// IMPORTAÇÕES
// =============================================
// - express: Framework para criação de rotas HTTP.
// - User: Modelo de usuário do sistema.
// - Account: Modelo de conta bancária do usuário.
// - Transaction: Modelo de transação financeira.
// - Category: Modelo de categoria de gastos.
// - AccountCategory: Modelo de relação usuário-categoria.
//
// =============================================
// O QUE O CÓDIGO FAZ
// =============================================
// Este arquivo define as rotas de webhook, geralmente utilizadas para integrações externas (ex: N8N, bots, automações).
// - Permite registrar transações automaticamente via integrações externas (ex: POST /transaction).
// - Permite consultar saldo, registrar gastos por categoria, consultar limites e gastos, etc, via integrações.
// - Facilita automações e integrações com outros sistemas, como WhatsApp, bots, etc.
//
// =============================================
// RELAÇÃO COM O FRONTEND
// =============================================
// - O frontend normalmente não consome diretamente essas rotas, mas pode se beneficiar de dados atualizados por integrações.
// - Essencial para automações, notificações e integrações externas que impactam o fluxo de dados do usuário.
// ============================================= 