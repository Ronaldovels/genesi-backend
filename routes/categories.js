import express from 'express';
import User from '../models/User.js';
const router = express.Router();

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