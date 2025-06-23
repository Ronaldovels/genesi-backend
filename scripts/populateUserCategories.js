import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({}, { strict: false });
const categorySchema = new mongoose.Schema({ name: String });
const userCategorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  limit: { type: Number, default: 0 },
  total_gasto: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema, 'users');
const Category = mongoose.model('Category', categorySchema, 'categories');
const UserCategory = mongoose.model('UserCategory', userCategorySchema, 'usercategories');

mongoose.connect('mongodb://localhost:27017/genesi', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const users = await User.find({});
    const categories = await Category.find({});

    for (const user of users) {
      for (const category of categories) {
        await UserCategory.updateOne(
          { user: user._id, category: category._id },
          { $setOnInsert: { user: user._id, category: category._id, limit: 0, total_gasto: 0 } },
          { upsert: true }
        );
      }
    }

    console.log('UserCategories populadas com sucesso!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

// =============================================
// TIPO DE ARQUIVO: SCRIPT UTILITÁRIO (MANUTENÇÃO)
// =============================================
// Este é um script auxiliar, executado manualmente, e não faz parte da API principal que atende o frontend.
//
// =============================================
// OBJETIVO E DESCRIÇÃO DO SCRIPT
// =============================================
// O objetivo deste script é popular a coleção 'usercategories', que representa a relação entre um usuário e uma categoria.
// Ele garante que cada usuário tenha um documento de associação para cada categoria existente no banco de dados.
//
// O que ele faz:
// 1. Conecta-se ao banco de dados MongoDB.
// 2. Busca todos os usuários e todas as categorias.
// 3. Para cada combinação de usuário e categoria, ele cria (se não existir) um documento na coleção 'usercategories',
//    inicializando o limite de gastos ('limit') e o total gasto ('total_gasto') com o valor 0.
// 4. Ao final, encerra a conexão com o banco.
//
// Quando usar:
// - Este script deve ser executado em cenários de manutenção ou inicialização do banco para garantir que as
//   relações de limites e gastos por categoria existam para todos os usuários.
//
// =============================================
// CONEXÃO COM O BANCO DE DADOS
// =============================================
// Por padrão, o script tenta se conectar a um banco de dados local ('mongodb://localhost:27017/genesi').
// **IMPORTANTE**: Se o seu banco de dados está na nuvem (ex: MongoDB Atlas), você DEVE alterar a string de conexão
// no código para apontar para o endereço correto do seu banco de dados na nuvem.
// =============================================