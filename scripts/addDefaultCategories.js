import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGO_URI = 'mongodb://localhost:27017/genesi';

const categoriasPadrao = [
  "Alimentação",
  "Casa",
  "Transporte",
  "Lazer",
  "Mercado",
  "Cuidados pessoais",
  "Despesas médicas",
  "Educação",
  "Família",
  "Pets",
  "Prestador de serviço"
];

async function atualizarUsuarios() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const usuarios = await User.find({});
  for (const usuario of usuarios) {
    if (!usuario.categories || usuario.categories.length === 0) {
      usuario.categories = categoriasPadrao;
      await usuario.save();
      console.log(`Categorias adicionadas para o usuário: ${usuario.email}`);
    }
  }
  await mongoose.disconnect();
  console.log('Atualização concluída!');
}

atualizarUsuarios().catch(console.error);

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este script utilitário serve para adicionar categorias padrão ao banco de dados.
//
// O que ele faz:
// - Conecta ao banco MongoDB.
// - Cria e insere categorias padrão na coleção de categorias, caso não existam.
// - Encerra a conexão com o banco.
//
// Conexão com o frontend:
// - Este script não é chamado diretamente pelo frontend, mas garante que as categorias padrão estejam disponíveis
//   para os usuários no momento do cadastro e uso do sistema.
// - É utilizado em processos de manutenção ou inicialização do banco de dados.
// =============================================

// =============================================
// INFORMAÇÕES ADICIONAIS E RECOMENDAÇÃO
// =============================================
// Este é o script recomendado para garantir que todos os usuários tenham categorias padrão.
// - Ele NÃO sobrescreve categorias já existentes dos usuários, apenas adiciona para quem não tem.
// - É seguro para rodar em produção, pois não remove dados dos usuários.
// - Útil para corrigir inconsistências ou inicializar usuários novos.
//
// IMPORTANTE:
// - Se o seu banco está na nuvem, ajuste a string de conexão (MONGO_URI) para o endereço correto do seu banco.
// - O script antigo (que sobrescrevia categorias) foi removido para evitar confusão e riscos de perda de dados.
// ============================================= 