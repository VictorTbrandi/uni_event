const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    senha: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    tipoPerfil: {
      type: String,
      enum: ['admin', 'organizador', 'participante'],
      default: 'participante'
    },
    curso: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null
    },
    ra: {
      type: String,
      trim: true,
      maxlength: 30,
      default: null
    },
    ativo: {
      type: Boolean,
      default: true
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.senha);
};

module.exports = mongoose.model('User', userSchema);
