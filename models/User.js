import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  whatsapp: { type: String, required: true, unique: true },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo define o modelo (schema) de Usuário (User) no banco de dados MongoDB usando Mongoose.
//
// O que ele faz:
// - Define os campos de um usuário: nome, email, senha, whatsapp e contas associadas.
// - Permite criar, buscar e manipular usuários do sistema.
//
// Conexão com o backend e frontend:
// - O backend utiliza este modelo para autenticação, cadastro e gerenciamento de usuários.
// - O frontend consome rotas (ex: /api/auth) que utilizam este modelo para login, registro e exibição de dados do usuário.
// - Essencial para todas as funcionalidades que dependem de autenticação e dados pessoais.
// ============================================= 