import RecurringIncome from '../models/RecurringIncome.js';

// @desc    Criar uma nova entrada programada
// @route   POST /api/recurring-incomes
export const createIncome = async (req, res) => {
  try {
    const newIncome = new RecurringIncome(req.body);
    await newIncome.save();
    res.status(201).json(newIncome);
  } catch (error) {
    console.error("Erro ao criar entrada programada:", error);
    res.status(400).json({ message: 'Erro ao criar entrada.', error: error.message });
  }
};

// @desc    Obter todas as entradas programadas de uma conta
// @route   GET /api/recurring-incomes/account/:accountId
export const getIncomeByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    // CORREÇÃO: Removido o .populate('category'), pois o modelo de entrada não possui este campo.
    const incomes = await RecurringIncome.find({ account: accountId })
      .sort({ createdAt: -1 });
      
    res.status(200).json(incomes);
  } catch (error) {
    console.error("Erro ao buscar entradas programadas:", error);
    res.status(500).json({ message: 'Erro ao buscar entradas.', error: error.message });
  }
};

// @desc    Atualizar uma entrada programada
// @route   PUT /api/recurring-incomes/:id
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedIncome = await RecurringIncome.findByIdAndUpdate(id, req.body, { 
        new: true,
        runValidators: true
    });
    if (!updatedIncome) {
      return res.status(404).json({ message: 'Entrada programada não encontrada.' });
    }
    res.status(200).json(updatedIncome);
  } catch (error) {
    console.error("Erro ao atualizar entrada programada:", error);
    res.status(400).json({ message: 'Erro ao atualizar entrada.', error: error.message });
  }
};

// @desc    Deletar uma entrada programada
// @route   DELETE /api/recurring-incomes/:id
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedIncome = await RecurringIncome.findByIdAndDelete(id);
    if (!deletedIncome) {
      return res.status(404).json({ message: 'Entrada programada não encontrada.' });
    }
    res.status(200).json({ message: 'Entrada deletada com sucesso.' });
  } catch (error) {
    console.error("Erro ao deletar entrada programada:", error);
    res.status(500).json({ message: 'Erro ao deletar entrada.', error: error.message });
  }
};
