import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const Category = mongoose.model('Category', CategorySchema);
export default Category;

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo define o modelo (schema) de Categoria (Category) no banco de dados MongoDB usando Mongoose.
//
// O que ele faz:
// - Define o campo nome da categoria, garantindo unicidade.
// - Permite criar, buscar e manipular categorias de gastos.
//
// Conexão com o backend e frontend:
// - O backend utiliza este modelo para gerenciar as categorias disponíveis para os usuários.
// - O frontend consome rotas que utilizam este modelo para exibir e cadastrar categorias.
// - Essencial para funcionalidades de organização e classificação de despesas.
// ============================================= 