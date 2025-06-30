import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  totalValue: {
    type: Number,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  repetition: {
    type: String,
    enum: ['unica', 'anual', 'mensal'],
    required: true,
  },
  repetitionCount: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isTermProject: {
    type: Boolean,
    default: false,
  },
  // NOVOS CAMPOS PARA CORRESPONDER AO MODAL
  type: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Essencial', 'Desejo', 'Sonho'],
    required: true,
  },
  hasAirfare: {
    type: Boolean,
    default: false,
  },
  // NOVO CAMPO PARA O VALOR ALOCADO
  allocatedValue: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);
export default Project;