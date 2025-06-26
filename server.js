import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';



// Carrega variáveis de ambiente do .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const api = process.env.SELF_API_URL

const allowedOrigins = [
  'http://localhost:8080',
  'https://genesi-rev.vercel.app',
  'https://genesi-kvr1.vercel.app',
  'http://192.168.15.7:8080'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem 'origin' (como Postman) ou de origens na lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Middlewares
// Habilita o pre-flight para todas as rotas
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB conectado!'))
  .catch((err) => console.error('Erro ao conectar no MongoDB:', err));

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Genesi rodando!');
});

// Importa rotas de autenticação (exemplo)
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

// Importa rotas de finanças
import financeRoutes from './routes/finance.js';
app.use('/api/finance', financeRoutes);

import categoriesRoutes from './routes/categories.js';
app.use('/api/categories', categoriesRoutes);

import wishesRoutes from './routes/wishes.js';
app.use('/api/wishes', wishesRoutes);

import accountsRoutes from './routes/accounts.js';
app.use('/api/accounts', accountsRoutes);

import webhookRoutes from './routes/webhook.js';
app.use('/api/webhook', webhookRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

/*const keepAlive = () => {
  axios.get(api)
    .then(() => console.log(`[KEEP-ALIVE] Ping enviado para ${api}`))
    .catch((error) => console.error('[KEEP-ALIVE] Erro ao pingar a API:', error.message));
};

// Executa o keepAlive a cada 5 minutos (300.000 ms)
setInterval(keepAlive, 5 * 60 * 1000);*/

// =============================================
// OBJETIVO E DESCRIÇÃO DO ARQUIVO
// =============================================
// Este arquivo é o ponto de entrada principal do backend da aplicação Genesi.
// Sua função é inicializar o servidor Express, configurar middlewares essenciais (como CORS e JSON),
// conectar ao banco de dados MongoDB e registrar todas as rotas principais da API.
//
// O que ele faz:
// - Carrega variáveis de ambiente.
// - Configura CORS para permitir requisições do frontend (localhost:8080 e genesi-rev.vercel.app).
// - Conecta ao MongoDB usando Mongoose.
// - Define middlewares globais para tratamento de JSON e CORS.
// - Registra rotas de autenticação, finanças, categorias, desejos, contas e webhooks.
// - Inicia o servidor na porta definida.
//
// Conexão com o frontend:
// - Todas as rotas expostas aqui (ex: /api/auth, /api/finance, /api/categories, etc) são consumidas pelo frontend React.
// - O frontend faz requisições HTTP para essas rotas para autenticação, cadastro, movimentações financeiras, manipulação de desejos, etc.
// - O CORS está configurado para aceitar requisições do domínio do frontend.
// - O backend serve como camada de API RESTful, fornecendo e persistindo dados para o frontend.
// ============================================= 