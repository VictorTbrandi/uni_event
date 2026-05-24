const mongoose = require('mongoose');

const universidadeSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 150
    },
    sigla: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      minlength: 2,
      maxlength: 20
    },
    cnpj: {
      type: String,
      trim: true,
      maxlength: 18,
      default: null
    },
    site: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null
    },
    logoUrl: {
      type: String,
      trim: true,
      maxlength: 500,
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
    endereco: {
      type: String,
      trim: true,
      maxlength: 250,
      default: null
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Universidade', universidadeSchema);
