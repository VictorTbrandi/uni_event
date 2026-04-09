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
    categoriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: true
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
      required: true
    },
    status: {
      type: String,
      enum: ['rascunho', 'aberto', 'encerrado', 'cancelado'],
      default: 'rascunho'
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
