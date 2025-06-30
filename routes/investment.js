import express from 'express';
import Investment from '../models/Investment.js';
import InvestmentAccount from '../models/InvestmentAccount.js';

const router = express.Router();

// GET: Obter todas as contas de investimento de um usuário
router.get('/accounts/:userId', async (req, res) => {
  try {
    const accounts = await InvestmentAccount.find({ user: req.params.userId });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar contas de investimento.' });
  }
});

// GET: Obter todos os ativos de uma conta de investimento específica
router.get('/:investmentAccountId', async (req, res) => {
  try {
    const investments = await Investment.find({ investmentAccount: req.params.investmentAccountId });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar investimentos.' });
  }
});

// POST: Adicionar um novo ativo (será usado pelo modal no futuro)
router.post('/', async (req, res) => {
  const { investmentAccountId, name, ticker, type, quantity, averagePrice, currentValue } = req.body;
  try {
    const newInvestment = new Investment({
      // CORREÇÃO: Mapeando a variável correta para o campo do Schema.
      investmentAccount: investmentAccountId, 
      name, 
      ticker, 
      type, 
      quantity, 
      averagePrice, 
      currentValue
    });
    await newInvestment.save();

    // Atualiza o valor total da conta de investimento
    await InvestmentAccount.findByIdAndUpdate(investmentAccountId, {
      $inc: { totalValue: currentValue }
    });

    res.status(201).json(newInvestment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar investimento.' });
  }
});

export default router;