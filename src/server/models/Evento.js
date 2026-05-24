const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150
    },
    descricao: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    data: {
      type: Date,
      required: true
    },
    horarioInicio: {
      type: String,
      required: true,
      trim: true
    },
    horarioFim: {
      type: String,
      required: true,
      trim: true
    },
    local: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    cidade: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null
    },
    uf: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
      default: null
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    previsaoTempoAtiva: {
      type: Boolean,
      default: false
    },
    cargaHoraria: {
      type: Number,
      required: true,
      min: 1
    },
    vagas: {
      type: Number,
      required: true,
      min: 1
    },
    inscricoesEncerramEm: {
      type: Date,
      default: null
    },
    categoriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: true
    },
    universidadeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Universidade',
      default: null
    },
    departamentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Departamento',
      default: null
    },
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null
    },
    palestrantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Palestrante'
      }
    ],
    organizadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['aberto', 'fechado', 'encerrado', 'cancelado'],
      default: 'fechado'
    },
    imagemUrl: {
      type: String,
      trim: true,
      default: null
    },
    permiteCertificado: {
      type: Boolean,
      default: true
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evento', eventoSchema);
