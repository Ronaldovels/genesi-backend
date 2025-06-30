import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  type: {
    type: String,
    enum: ['entrada', 'saida'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  value: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // NOVO CAMPO: Referência à categoria (opcional, pois entradas não têm)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Refere-se à coleção global de Categorias
    required: false, 
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo define o modelo (schema) de Transação (Transaction) no banco de dados MongoDB usando Mongoose.
//
// O que ele faz:
// - Define os campos de uma transação financeira: conta, descrição, valor, tipo (entrada/saída), data e categoria.
// - Permite registrar, buscar e manipular transações financeiras dos usuários.
//
// Conexão com o backend e frontend:
// - O backend utiliza este modelo para registrar e consultar movimentações financeiras.
// - O frontend consome rotas (ex: /api/finance) que utilizam este modelo para exibir extratos, gráficos e relatórios.
// - Essencial para funcionalidades de controle financeiro, histórico e análises.
// ============================================= 