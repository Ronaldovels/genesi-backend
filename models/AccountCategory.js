import mongoose from 'mongoose';

const AccountCategorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  limit: {
    type: Number,
    default: 0
  },
  total_gasto: {
    type: Number,
    default: 0
  }
});

// Garante que a combinação de usuário e categoria seja única
AccountCategorySchema.index({ user: 1, category: 1 }, { unique: true });

const AccountCategory = mongoose.model('AccountCategory', AccountCategorySchema, 'usercategories');
export default AccountCategory;

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo define o modelo (schema) de AccountCategory (relação entre usuário e categoria)
// no banco de dados MongoDB usando Mongoose.
//
// O que ele faz:
// - Representa a associação entre um usuário e uma categoria, incluindo limite de gastos e total gasto.
// - Garante que cada usuário tenha apenas uma relação única com cada categoria.
//
// Conexão com o backend e frontend:
// - O backend utiliza este modelo para controlar limites e gastos por categoria de cada usuário.
// - O frontend consome rotas que utilizam este modelo para exibir limites, gastos e alertas de categorias.
// - Essencial para funcionalidades de controle de orçamento e relatórios por categoria.
// ============================================= 