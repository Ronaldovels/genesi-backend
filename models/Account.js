import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: true,
    default: 'Conta Principal'
  },
  balance: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

const Account = mongoose.model('Account', AccountSchema);
export default Account;

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo define o modelo (schema) de Conta (Account) no banco de dados MongoDB usando Mongoose.
//
// O que ele faz:
// - Define os campos de uma conta: usuário dono, nome da conta e saldo.
// - Permite criar, buscar e manipular contas associadas a usuários.
//
// Conexão com o backend e frontend:
// - O backend utiliza este modelo para persistir e consultar contas dos usuários.
// - O frontend consome rotas (ex: /api/accounts) que utilizam este modelo para exibir e gerenciar contas do usuário.
// - É fundamental para funcionalidades de controle financeiro, saldo e movimentações.
// ============================================= 