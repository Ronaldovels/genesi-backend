import cron from 'node-cron';
import RecurringExpense from '../models/recurringExprense.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import mongoose from 'mongoose';

/**
 * Verifica e processa as despesas programadas que vencem no dia atual.
 */
const processDailyRecurringExpenses = async () => {
  console.log('[Scheduler] Verificando despesas programadas do dia...');
  
  const today = new Date();
  // Ajusta para o início do dia para comparações consistentes
  today.setHours(0, 0, 0, 0); 
  const currentDay = today.getDate();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  try {
    // 1. Encontra todas as despesas cujo dia de cobrança é hoje.
    const expensesDueToday = await RecurringExpense.find({ billingDay: currentDay });

    if (expensesDueToday.length === 0) {
      console.log('[Scheduler] Nenhuma despesa com vencimento hoje.');
      return;
    }

    // 2. Itera sobre cada despesa que vence hoje.
    for (const expense of expensesDueToday) {
      // Filtro para despesas temporárias que já expiraram
      if (expense.type === 'FIXA_TEMPORARIA' && expense.endDate < today) {
        console.log(`[Scheduler] Ignorando despesa temporária expirada: ${expense.name}`);
        continue;
      }

      // 3. Verifica se a transação para este mês já foi criada para evitar duplicatas.
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const existingTransaction = await Transaction.findOne({
        account: expense.account,
        // Usamos uma descrição específica para identificar a origem automática
        description: `Pagamento Automático: ${expense.name}`, 
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });

      if (existingTransaction) {
        console.log(`[Scheduler] Despesa "${expense.name}" já processada este mês. Ignorando.`);
        continue;
      }

      // 4. Se não existe, cria a transação.
      console.log(`[Scheduler] Processando despesa: ${expense.name}`);

      const account = await Account.findById(expense.account);
      if (!account) {
        console.error(`[Scheduler] Conta ${expense.account} não encontrada para a despesa ${expense.name}.`);
        continue;
      }

      // Cria a nova transação de saída
      const newTransaction = new Transaction({
        account: expense.account,
        type: 'saida',
        date: new Date(), // Usa a data/hora atual da execução
        value: expense.value,
        description: `Pagamento Automático: ${expense.name}`, // Descrição para identificar
        category: expense.category,
      });
      await newTransaction.save();

      // Atualiza o saldo da conta
      account.balance -= expense.value;
      await account.save();

      console.log(`[Scheduler] Transação para "${expense.name}" criada com sucesso!`);
    }

  } catch (error) {
    console.error('[Scheduler] Erro ao processar despesas programadas:', error);
  }
  console.log('[Scheduler] Verificação diária concluída.');
};

/**
 * Inicia o agendador de tarefas.
 * A tarefa será executada todos os dias às 02:00 da manhã.
 * O formato cron é: 'minuto hora dia-do-mês mês dia-da-semana'
 */
export const startScheduler = () => {
  // '0 2 * * *' -> Executa todo dia às 2 da manhã.
  cron.schedule('0 2 * * *', processDailyRecurringExpenses, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });

  console.log('[Scheduler] Agendador de transações iniciado. Próxima execução às 02:00.');

  // Opcional: Executar uma vez ao iniciar o servidor para testes
  // processDailyRecurringExpenses();
};
