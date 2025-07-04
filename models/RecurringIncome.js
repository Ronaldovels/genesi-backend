import mongoose from 'mongoose';

const RecurringIncomeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome da entrada é obrigatório.'],
    trim: true
  },
  value: {
    type: Number,
    required: [true, 'O valor da entrada é obrigatório.'],
  },
  billingDay: {
    type: Number,
    required: [true, 'O dia da entrada é obrigatório.'],
    min: [1, 'O dia da entrada deve ser entre 1 e 31.'],
    max: [31, 'O dia da entrada deve ser entre 1 e 31.']
  },
  // O tipo é sempre 'entrada', mas podemos manter para consistência futura
  type: {
    type: String,
    required: true,
    default: 'entrada',
    enum: ['entrada'], // Antes estava 'ENTRADA_RECORRENTE'
  },
  frequency: {
    type: String,
    enum: ['DIARIA', 'SEMANAL', 'MENSAL', 'ANUAL'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
}, { timestamps: true });

const RecurringIncome = mongoose.model('RecurringIncome', RecurringIncomeSchema);

export default RecurringIncome;
