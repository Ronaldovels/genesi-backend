import express from 'express';
import Category from '../models/Category.js';
import AccountCategory from '../models/AccountCategory.js';
import User from '../models/User.js';
const router = express.Router();


// NOVO: Rota para encontrar/criar uma categoria e associá-la a um usuário
router.post('/assign', async (req, res) => {
  const { userId, categoryName, limit = 0 } = req.body;

  if (!userId || !categoryName) {
    return res.status(400).json({ message: 'ID do usuário e nome da categoria são obrigatórios.' });
  }

  try {
    // Passo 1: Encontra ou cria a categoria na coleção GLOBAL de categorias
    let category = await Category.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${categoryName}$`, 'i') } }, // Busca case-insensitive
      { $setOnInsert: { name: categoryName } },
      { upsert: true, new: true } // 'upsert' cria se não existir, 'new' retorna o doc novo
    );

    // Passo 2: Verifica se o usuário já tem essa categoria associada
    const existingLink = await AccountCategory.findOne({
      user: userId,
      category: category._id
    });

    if (existingLink) {
      return res.status(409).json({ message: `A categoria "${categoryName}" já foi adicionada.` }); // 409 Conflict
    }

    // Passo 3: Cria a associação entre o usuário e a categoria
    const newAccountCategory = new AccountCategory({
      user: userId,
      category: category._id,
      limit: limit, // Usa o limite recebido
      total_gasto: 0
    });

    await newAccountCategory.save();

    res.status(201).json({ message: 'Categoria adicionada com sucesso!', category: newAccountCategory });

  } catch (error) {
    console.error("Erro ao associar categoria:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// NOVO: Rota para ATUALIZAR o limite de uma categoria associada
router.put('/assign/:linkId', async (req, res) => {
  const { linkId } = req.params;
  const { limit } = req.body;

  if (limit === undefined || isNaN(parseFloat(limit)) || limit < 0) {
    return res.status(400).json({ message: 'Um valor de limite válido é obrigatório.' });
  }

  try {
    const updatedLink = await AccountCategory.findByIdAndUpdate(
      linkId,
      { limit: parseFloat(limit) },
      { new: true }
    );
    if (!updatedLink) {
      return res.status(404).json({ message: 'Associação de categoria não encontrada.' });
    }
    res.json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


// Adicionar categoria ao usuário
router.post('/:whatsapp', async (req, res) => {
  try {
    const { nome } = req.body;
    const { whatsapp } = req.params;
    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (!user.categories.includes(nome)) {
      user.categories.push(nome);
      await user.save();
    }
    res.status(201).json(user.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar categorias do usuário
router.get('/:whatsapp', async (req, res) => {
  try {
    const { whatsapp } = req.params;
    const user = await User.findOne({ whatsapp });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Listar todas as categorias associadas a um usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userCategories = await AccountCategory.find({ user: userId }).populate('category', 'name');
    
    const categories = userCategories.map(uc => ({
      _id: uc.category._id,
      name: uc.category.name
    }));

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar categorias do usuário.' });
  }
});

// NOVO: Rota para remover a associação de uma categoria com um usuário
router.delete('/assign/:linkId', async (req, res) => {
  const { linkId } = req.params;

  try {
    const deletedLink = await AccountCategory.findByIdAndDelete(linkId);

    if (!deletedLink) {
      return res.status(404).json({ message: 'Associação de categoria não encontrada.' });
    }

    // Opcional: Aqui você poderia verificar se o usuário que fez a requisição
    // é o dono do 'deletedLink.user', por segurança.

    res.status(200).json({ message: 'Categoria removida com sucesso.' });

  } catch (error) {
    console.error("Erro ao remover associação de categoria:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

export default router;

// =============================================
// IMPORTAÇÕES
// =============================================
// - express: Framework para criação de rotas HTTP.
// - User: Modelo de usuário do sistema.
//
// =============================================
// O QUE O CÓDIGO FAZ
// =============================================
// Este arquivo define as rotas relacionadas às categorias dos usuários.
// - Permite adicionar uma nova categoria ao usuário (POST /:whatsapp).
// - Permite listar todas as categorias de um usuário (GET /:whatsapp).
//
// =============================================
// RELAÇÃO COM O FRONTEND
// =============================================
// - O frontend consome essas rotas para exibir e cadastrar categorias personalizadas para o usuário.
// - Essencial para funcionalidades de organização, classificação e personalização de despesas.
// ============================================= 