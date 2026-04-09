const mongoose = require('mongoose');

const inscricaoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evento',
      required: true
    },
    dataInscricao: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['ativa', 'cancelada', 'confirmada', 'participante'],
      default: 'ativa'
    },
    presencaConfirmada: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

inscricaoSchema.index({ usuarioId: 1, eventoId: 1 }, { unique: true });

module.exports = mongoose.model('Inscricao', inscricaoSchema);
