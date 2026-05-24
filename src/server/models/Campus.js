const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema(
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
      maxlength: 120
    },
    sigla: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 20,
      default: null
    },
    endereco: {
      type: String,
      trim: true,
      maxlength: 250,
      default: null
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
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

campusSchema.index({ universidadeId: 1, nome: 1 }, { unique: true });

module.exports = mongoose.model('Campus', campusSchema);
