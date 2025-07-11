import RecurringExpense from '../models/RecurringExpense.js';

// @desc    Criar uma nova despesa programada
// @route   POST /api/recurring-expenses
export const createExpense = async (req, res) => {
  try {
    // Os dados virão do corpo da requisição, já validados pelo frontend
    const newExpense = new RecurringExpense(req.body);
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Erro ao criar despesa programada:", error);
    res.status(400).json({ message: 'Erro ao criar despesa.', error: error.message });
  }
};

// @desc    Obter todas as despesas programadas de uma conta
// @route   GET /api/recurring-expenses/account/:accountId
export const getExpensesByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const expenses = await RecurringExpense.find({ account: accountId })
      .populate('category', 'name color') // <-- MÁGICA ACONTECE AQUI!
      .sort({ createdAt: -1 });
      
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Erro ao buscar despesas programadas:", error);
    res.status(500).json({ message: 'Erro ao buscar despesas.', error: error.message });
  }
};

// @desc    Atualizar uma despesa programada
// @route   PUT /api/recurring-expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = await RecurringExpense.findByIdAndUpdate(id, req.body, { 
        new: true, // Retorna o documento atualizado
        runValidators: true // Roda as validações do schema (ex: required condicional)
    });
    if (!updatedExpense) {
      return res.status(404).json({ message: 'Despesa programada não encontrada.' });
    }
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Erro ao atualizar despesa programada:", error);
    res.status(400).json({ message: 'Erro ao atualizar despesa.', error: error.message });
  }
};

// @desc    Deletar uma despesa programada
// @route   DELETE /api/recurring-expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await RecurringExpense.findByIdAndDelete(id);
    if (!deletedExpense) {
      return res.status(404).json({ message: 'Despesa programada não encontrada.' });
    }
    res.status(200).json({ message: 'Despesa deletada com sucesso.' });
  } catch (error) {
    console.error("Erro ao deletar despesa programada:", error);
    res.status(500).json({ message: 'Erro ao deletar despesa.', error: error.message });
  }
};
