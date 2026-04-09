const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
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
    nota: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comentario: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    }
  },
  {
    timestamps: true
  }
);

feedbackSchema.index({ usuarioId: 1, eventoId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
