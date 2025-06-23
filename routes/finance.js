import express from 'express';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import mongoose from 'mongoose';
import AccountCategory from '../models/AccountCategory.js';

const router = express.Router();

// POST: Adicionar uma nova transação (entrada ou saída)
router.post('/transaction', async (req, res) => {
  try {
    const { accountId, type, date, value, description } = req.body;

    if (!accountId || !type || !value || !description) {
      return res.status(400).json({ message: 'Dados da transação incompletos.' });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada.' });
    }

    // Cria a nova transação
    const transaction = new Transaction({
      account: accountId,
      type,
      date: date || new Date(),
      value,
      description
    });
    await transaction.save();

    // Atualiza o saldo da conta
    const amount = type === 'entrada' ? value : -value;
    account.balance += amount;
    await account.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Erro ao adicionar transação:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// GET: Obter o resumo financeiro de uma conta para um mês/ano específico
router.get('/summary/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { month, year } = req.query; // Ex: month=7 (Julho), year=2024

    if (!month || !year) {
      return res.status(400).json({ message: 'Mês e ano são obrigatórios.' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Calcula o total de entradas no período
    const entradas = await Transaction.aggregate([
      { $match: { account: new mongoose.Types.ObjectId(accountId), type: 'entrada', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);

    // Calcula o total de saídas no período
    const saidas = await Transaction.aggregate([
        { $match: { account: new mongoose.Types.ObjectId(accountId), type: 'saida', date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    
    // Pega o saldo atual da conta
    const account = await Account.findById(accountId);
    if (!account) {
        return res.status(404).json({ message: 'Conta não encontrada.' });
    }

    res.json({
      entradas: entradas.length > 0 ? entradas[0].total : 0,
      saidas: saidas.length > 0 ? saidas[0].total : 0,
      saldoTotal: account.balance
    });

  } catch (error) {
    console.error("Erro ao buscar resumo financeiro:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// GET: Listar as transações recentes de uma conta
router.get('/transactions/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { limit = 5 } = req.query; 

    const transactions = await Transaction.find({ 
      account: accountId,
      type: { $in: ['entrada', 'saida'] }
    })
      .sort({ date: -1 })
      .limit(Number(limit)); 

    res.json(transactions);

  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// GET: Obter o resumo de gastos por categoria para uma conta
router.get('/category-summary/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await Account.findById(accountId).populate('user');
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada.' });
    }
    const userId = account.user._id;
    
    // 1. Obter todas as categorias associadas ao usuário
    const userCategories = await AccountCategory.find({ user: userId }).populate('category');

    // 2. Para cada categoria, calcular o total de gastos (na conta específica)
    const summary = await Promise.all(userCategories.map(async (userCategory) => {
      const accountCategoryId = userCategory._id; 
      
      const result = await Transaction.aggregate([
        { $match: { 
            account: new mongoose.Types.ObjectId(accountId), 
            category: accountCategoryId,
            type: 'saida' 
        }},
        { $group: { 
            _id: null, 
            total: { $sum: '$value' } 
        }}
      ]);

      return {
        name: userCategory.category.name,
        total: result.length > 0 ? result[0].total : 0,
        limit: userCategory.limit // Adicionando o limite na resposta
      };
    }));

    res.json(summary);

  } catch (error) {
    console.error("Erro ao buscar resumo por categoria:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

export default router; 




// =============================================
// IMPORTAÇÕES
// =============================================
// - express: Framework para criação de rotas HTTP.
// - Transaction: Modelo de transação financeira.
// - Account: Modelo de conta bancária do usuário.
// - mongoose: ODM para MongoDB, usado para agregações.
// - AccountCategory: Modelo de relação usuário-categoria.
//
// =============================================
// O QUE O CÓDIGO FAZ
// =============================================
// Este arquivo define as rotas relacionadas às operações financeiras dos usuários.
// - Permite adicionar transações (entradas e saídas) em contas.
// - Permite obter resumos financeiros (entradas, saídas, saldo total) por conta e período.
// - Permite listar transações recentes de uma conta.
// - Permite obter resumo de gastos por categoria.
//
// =============================================
// RELAÇÃO COM O FRONTEND
// =============================================
// - O frontend consome essas rotas para registrar movimentações, exibir extratos, gráficos e relatórios financeiros.
// - Essencial para funcionalidades de controle financeiro, análise de gastos e acompanhamento de saldo.
// =============================================
