import mongoose from 'mongoose';

const InvestmentAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { // Ex: "Carteira XP", "Renda Fixa NuInvest"
    type: String,
    required: true,
  },
  totalValue: { // O valor total consolidado desta conta de investimento
    type: Number,
    default: 0,
  },
  // Opcional, mas útil para diferenciar contas de investimento se o usuário tiver várias
  accountIndex: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

InvestmentAccountSchema.index({ user: 1, accountIndex: 1 }, { unique: true });

const InvestmentAccount = mongoose.model('InvestmentAccount', InvestmentAccountSchema);
export default InvestmentAccount;