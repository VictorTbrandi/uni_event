const mongoose = require('mongoose');

const tiposPermitidos = [
  'palestra',
  'workshop',
  'mesa_redonda',
  'minicurso',
  'sessao_posters',
  'apresentacao_oral',
  'cerimonia',
  'intervalo'
];

const atividadeSchema = new mongoose.Schema(
  {
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evento',
      required: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 180
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: null
    },
    tipo: {
      type: String,
      enum: tiposPermitidos,
      required: true,
      default: 'palestra'
    },
    inicio: {
      type: Date,
      required: true
    },
    fim: {
      type: Date,
      required: true
    },
    salaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sala',
      default: null
    },
    salaTexto: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null
    },
    palestrantes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Palestrante'
    }],
    cargaHoraria: {
      type: Number,
      min: 0,
      default: null
    },
    capacidadeMax: {
      type: Number,
      min: 1,
      default: null
    },
    ordem: {
      type: Number,
      default: 0
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

atividadeSchema.index({ eventoId: 1, inicio: 1 });

module.exports = mongoose.model('Atividade', atividadeSchema);
module.exports.tiposPermitidos = tiposPermitidos;
