import express from 'express';
import * as recurringCtrl from '../controllers/recurringIncomeController.js';

const router = express.Router();

// Rota para criar uma nova despesa programada
router.post('/', recurringCtrl.createIncome);

// Rota para obter todas as despesas de uma conta específica
router.get('/account/:accountId', recurringCtrl.getIncomeByAccount);

// Rota para atualizar uma despesa existente pelo seu ID
router.put('/:id', recurringCtrl.updateIncome);

// Rota para deletar uma despesa pelo seu ID
router.delete('/:id', recurringCtrl.deleteIncome);

export default router;

// =============================================
// IMPORTAÇÕES
// =============================================
// - express: Framework para criação de rotas HTTP.
// - recurringCtrl: Objeto contendo as funções de controller para a lógica de negócio.
//
// =============================================
// O QUE O CÓDIGO FAZ
// =============================================
// Este arquivo define as rotas da API para o recurso de Despesas Programadas.
// Ele mapeia os endpoints HTTP (ex: /api/recurring-expenses) para as funções
// correspondentes no controller, implementando um CRUD completo.
//
// =============================================
// RELAÇÃO COM O FRONTEND
// =============================================
// - O frontend (React) fará requisições a estes endpoints para:
//   - POST '/': Adicionar uma nova despesa através do modal.
//   - GET '/account/:accountId': Listar as despesas programadas na tela de Plano.
//   - PUT '/:id': Editar uma despesa existente.
//   - DELETE '/:id': Remover uma despesa da lista.
// =============================================
