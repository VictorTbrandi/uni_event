const mongoose = require('mongoose');

const grausPermitidos = ['graduacao', 'pos_graduacao', 'mestrado', 'doutorado', 'tecnico', 'extensao'];

const cursoSchema = new mongoose.Schema(
  {
    universidadeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Universidade',
      required: true
    },
    departamentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Departamento',
      default: null
    },
    nome: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150
    },
    grau: {
      type: String,
      enum: grausPermitidos,
      required: true,
      default: 'graduacao'
    },
    cargaHorariaTotal: {
      type: Number,
      min: 1,
      default: null
    },
    duracaoSemestres: {
      type: Number,
      min: 1,
      max: 20,
      default: null
    },
    coordenadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

cursoSchema.index({ universidadeId: 1, nome: 1 }, { unique: true });

module.exports = mongoose.model('Curso', cursoSchema);
module.exports.grausPermitidos = grausPermitidos;
