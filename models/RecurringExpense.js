import mongoose from 'mongoose';

const RecurringExpenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome da despesa é obrigatório.'],
    trim: true
  },
  value: {
    type: Number,
    required: [true, 'O valor da despesa é obrigatório.'],
  },
  billingDay: {
    type: Number,
    required: [true, 'O dia da cobrança é obrigatório.'],
    min: [1, 'O dia da cobrança deve ser entre 1 e 31.'],
    max: [31, 'O dia da cobrança deve ser entre 1 e 31.']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Referência ao seu modelo de Categoria
    required: [true, 'A categoria é obrigatória.']
  },
  // Define o tipo da despesa para lógica condicional no frontend e backend
  type: {
    type: String,
    required: true,
    enum: ['FIXA', 'FIXA_TEMPORARIA', 'RECORRENTE'], // Apenas estes valores são permitidos
  },
  // Relevante para 'FIXA' e 'FIXA_TEMPORARIA'
  frequency: {
    type: String,
    enum: ['DIARIA', 'SEMANAL', 'MENSAL', 'ANUAL'],
    // Obrigatório apenas se o tipo não for 'RECORRENTE'
    required: function() { return this.type === 'FIXA' || this.type === 'FIXA_TEMPORARIA'; }
  },
  // Relevante apenas para 'FIXA_TEMPORARIA'
  endDate: {
    type: Date,
    required: function() { return this.type === 'FIXA_TEMPORARIA'; }
  },
  // Link para o usuário dono
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Link para a conta específica
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
}, { timestamps: true });

const RecurringExpense = mongoose.model('RecurringExpense', RecurringExpenseSchema);

export default RecurringExpense;

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo define o modelo (schema) de Despesa Programada (RecurringExpense) no MongoDB.
//
// O que ele faz:
// - Estrutura os dados para despesas que se repetem, como aluguel, assinaturas ou parcelamentos.
// - Inclui campos condicionais (frequency, endDate) que dependem do tipo de despesa.
// - Associa cada despesa a um usuário (User) e a uma conta específica (Account).
//
// Conexão com o backend e frontend:
// - O backend usa este modelo para criar, ler, atualizar e deletar despesas programadas.
// - O frontend consome as rotas da API que manipulam este modelo para permitir que o usuário
//   gerencie suas despesas fixas, temporárias e recorrentes na tela de "Plano de Gastos".
// =============================================
