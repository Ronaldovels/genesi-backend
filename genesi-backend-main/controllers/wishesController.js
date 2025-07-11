import User from '../models/User.js';
import Wish from '../models/Wish.js';

export async function createWish(req, res) {
  try {
    const { whatsapp, descricao_produto, limite_preco, modo, preco_medio_base } = req.body;
    if (!whatsapp || !descricao_produto || !modo) {
      return res.status(400).json({ message: 'Campos obrigatórios não informados.' });
    }

    const modosPermitidos = ['busca_imediata', 'monitoramento_promocional', 'limite_definido'];
    if (!modosPermitidos.includes(modo)) {
      return res.status(400).json({ message: 'Modo inválido. Valores permitidos: busca_imediata, monitoramento_promocional, limite_definido.' });
    }

    const user = await User.findOne({ whatsapp });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const wish = new Wish({
      user: user._id,
      descricao_produto,
      limite_preco,
      modo,
      preco_medio_base
    });
    await wish.save();

    res.status(201).json({ message: 'Desejo de compra criado com sucesso!', wish });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar desejo de compra.', error: error.message });
  }
}

export async function listWishes(req, res) {
  try {
    const wishes = await Wish.find().sort({ createdAt: -1 }).populate('user', 'name whatsapp');
    res.json({ wishes });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar desejos.', error: error.message });
  }
}

export async function updateWish(req, res) {
  try {
    const { id } = req.params;
    const update = req.body;
    const wish = await Wish.findByIdAndUpdate(id, update, { new: true });
    if (!wish) {
      return res.status(404).json({ message: 'Desejo não encontrado.' });
    }
    res.json({ message: 'Desejo atualizado com sucesso!', wish });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar desejo.', error: error.message });
  }
} 


// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo implementa o controller responsável por gerenciar os desejos de compra dos usuários.
// Ele define funções para criar, listar e atualizar desejos, sendo utilizado pelas rotas relacionadas a desejos.
//
// O que ele faz:
// - Cria desejos de compra vinculados a um usuário.
// - Lista todos os desejos cadastrados, com informações do usuário.
// - Atualiza desejos existentes (por exemplo, alterar informações ou status).
//
// Conexão com o frontend:
// - As funções deste controller são utilizadas pelas rotas de desejos (ex: /api/wishes),
//   que são consumidas pelo frontend para exibir, criar e atualizar desejos dos usuários.
// - O frontend faz requisições HTTP para essas rotas para manipular os desejos de compra.
// =============================================
