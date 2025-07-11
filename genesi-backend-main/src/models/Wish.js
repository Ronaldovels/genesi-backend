import mongoose from 'mongoose';

const WishSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  descricao_produto: {
    type: String,
    required: true
  },
  limite_preco: {
    type: Number
  },
  notificado: {
    type: Boolean,
    default: false
  },
  modo: {
    type: String,
    enum: ['busca_imediata', 'monitoramento_promocional', 'limite_definido'],
    required: true
  },
  preco_medio_base: {
    type: Number,
    default: null
  },
  valor: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Wish = mongoose.model('Wish', WishSchema);
export default Wish;

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo define o modelo (schema) de Desejo (Wish) no banco de dados MongoDB usando Mongoose.
//
// O que ele faz:
// - Define os campos de um desejo de compra: conta, descrição do produto, limite de preço, modo, preço médio, valor, notificado, etc.
// - Permite criar, buscar e manipular desejos de compra dos usuários.
//
// Conexão com o backend e frontend:
// - O backend utiliza este modelo para registrar e consultar desejos de compra dos usuários.
// - O frontend consome rotas (ex: /api/wishes) que utilizam este modelo para exibir, criar e atualizar desejos.
// - Essencial para funcionalidades de planejamento de compras e notificações de oportunidades.
// ============================================= 