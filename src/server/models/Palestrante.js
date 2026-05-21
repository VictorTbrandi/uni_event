const mongoose = require('mongoose');

const palestranteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    biografia: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },
    areaAtuacao: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null
    },
    instituicao: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null
    },
    fotoUrl: {
      type: String,
      trim: true,
      default: null
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Palestrante', palestranteSchema);
