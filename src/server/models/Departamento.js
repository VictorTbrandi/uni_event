const mongoose = require('mongoose');

const departamentoSchema = new mongoose.Schema(
  {
    universidadeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Universidade',
      required: true
    },
    nome: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150
    },
    sigla: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 20,
      default: null
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

departamentoSchema.index({ universidadeId: 1, nome: 1 }, { unique: true });

module.exports = mongoose.model('Departamento', departamentoSchema);
