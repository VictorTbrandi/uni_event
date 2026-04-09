const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 80
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categoria', categoriaSchema);
