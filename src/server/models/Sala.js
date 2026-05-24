const mongoose = require('mongoose');

const recursosPermitidos = [
  'projetor',
  'tela',
  'ar_condicionado',
  'wifi',
  'lousa',
  'computadores',
  'sistema_som',
  'microfone',
  'transmissao',
  'acessibilidade'
];

const salaSchema = new mongoose.Schema(
  {
    universidadeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Universidade',
      required: true
    },
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null
    },
    nome: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    bloco: {
      type: String,
      trim: true,
      maxlength: 40,
      default: null
    },
    capacidade: {
      type: Number,
      required: true,
      min: 1
    },
    recursos: [{
      type: String,
      enum: recursosPermitidos
    }],
    observacoes: {
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

salaSchema.index({ universidadeId: 1, campusId: 1, nome: 1 }, { unique: true });

module.exports = mongoose.model('Sala', salaSchema);
module.exports.recursosPermitidos = recursosPermitidos;
