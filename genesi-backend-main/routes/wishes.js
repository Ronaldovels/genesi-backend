import express from 'express';
import Wish from '../models/Wish.js';
import User from '../models/User.js'; // Precisamos do modelo User

const router = express.Router();

// GET all wishes for a specific user by whatsapp
router.get('/:whatsapp', async (req, res) => {
  try {
    const { whatsapp } = req.params; 

    if (!whatsapp) {
      return res.status(400).json({ message: 'O número de WhatsApp do usuário é obrigatório.' });
    }

    // Encontra o usuário pelo número de whatsapp para obter o ID
    const user = await User.findOne({ whatsapp: whatsapp });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    
    // Busca os desejos que pertencem àquele usuário usando o ID dele
    // O campo 'user' no modelo Wish deve estar corretamente populado com o ObjectId do usuário
    const wishes = await Wish.find({ user: user._id });
    res.json(wishes);
  } catch (error) {
    console.error("Erro ao buscar desejos:", error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST a new wish
router.post('/', async (req, res) => {
  try {
    const { nome, valor, userId } = req.body; // Incluir userId

    if (!userId) {
      return res.status(400).json({ message: 'O ID do usuário é obrigatório para criar um desejo.' });
    }

    const newWish = new Wish({
      nome,
      valor,
      user: userId, // Associar o desejo ao usuário
      notificado: false,
    });

    const savedWish = await newWish.save();
    res.status(201).json(savedWish);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH to update a wish (e.g., toggle notification)
router.patch('/:id', async (req, res) => {
  try {
    const { notificado } = req.body;
    const updatedWish = await Wish.findByIdAndUpdate(
      req.params.id,
      { notificado },
      { new: true }
    );
    if (!updatedWish) return res.status(404).json({ message: "Desejo não encontrado" });
    res.json(updatedWish);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a wish
router.delete('/:id', async (req, res) => {
  try {
    const deletedWish = await Wish.findByIdAndDelete(req.params.id);
    if (!deletedWish) return res.status(404).json({ message: "Desejo não encontrado" });
    res.json({ message: 'Desejo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

// =============================================
// IMPORTAÇÕES
// =============================================
// - express: Framework para criação de rotas HTTP.
// - Wish: Modelo de desejo de compra do usuário.
// - User: Modelo de usuário do sistema.
//
// =============================================
// O QUE O CÓDIGO FAZ
// =============================================
// Este arquivo define as rotas relacionadas aos desejos de compra dos usuários.
// - Permite listar todos os desejos de um usuário (GET /:whatsapp).
// - Permite criar um novo desejo (POST /).
// - Permite atualizar o status de notificação de um desejo (PATCH /:id).
// - Permite deletar um desejo (DELETE /:id).
//
// =============================================
// RELAÇÃO COM O FRONTEND
// =============================================
// - O frontend consome essas rotas para exibir, criar, atualizar e remover desejos de compra dos usuários.
// - Essencial para funcionalidades de planejamento de compras, notificações e acompanhamento de desejos.
// ============================================= 