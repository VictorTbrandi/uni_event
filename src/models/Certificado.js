const mongoose = require('mongoose');

const certificadoSchema = new mongoose.Schema(
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
    codigoValidacao: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    dataEmissao: {
      type: Date,
      default: Date.now
    },
    cargaHoraria: {
      type: Number,
      required: true,
      min: 1
    },
    urlArquivo: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: ['emitido', 'revogado'],
      default: 'emitido'
    }
  },
  { timestamps: true }
);

certificadoSchema.index({ usuarioId: 1, eventoId: 1 }, { unique: true });

module.exports = mongoose.model('Certificado', certificadoSchema);
