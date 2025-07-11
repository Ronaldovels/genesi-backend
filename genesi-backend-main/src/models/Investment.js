import mongoose from 'mongoose';

const InvestmentSchema = new mongoose.Schema({
  investmentAccount: { // Vínculo com a conta de investimento
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentAccount',
    required: true,
  },
  name: { // Ex: "Tesouro Selic 2029", "Ações da Apple"
    type: String,
    required: true,
  },
  ticker: { // Ex: "PETR4", "AAPL", "MXRF11". Útil para buscar cotações no futuro.
    type: String,
    uppercase: true,
    trim: true,
  },
  type: { // O tipo que você sugeriu
    type: String,
    required: true,
    enum: ['Renda Fixa', 'Ações', 'Fundos', 'Cripto', 'REITs', 'Outro'],
  },
  quantity: { // Quantidade de cotas/ações
    type: Number,
    default: 0,
  },
  averagePrice: { // Preço médio de compra
    type: Number,
    default: 0,
  },
  currentValue: { // Valor total atualizado do ativo (quantity * cotação atual)
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Investment = mongoose.model('Investment', InvestmentSchema);
export default Investment;