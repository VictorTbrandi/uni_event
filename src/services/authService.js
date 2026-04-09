const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

class AuthService {
  async register(payload) {
    const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'Já existe um usuário cadastrado com este e-mail.');
    }

    const user = await User.create(payload);
    const token = generateToken({ id: user._id, tipoPerfil: user.tipoPerfil });

    return {
      user: await User.findById(user._id).select('-senha'),
      token
    };
  }

  async login(email, senha) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+senha');

    if (!user) {
      throw new ApiError(401, 'Credenciais inválidas.');
    }

    const passwordMatch = await user.comparePassword(senha);
    if (!passwordMatch || !user.ativo) {
      throw new ApiError(401, 'Credenciais inválidas ou usuário inativo.');
    }

    const token = generateToken({ id: user._id, tipoPerfil: user.tipoPerfil });

    return {
      user: await User.findById(user._id).select('-senha'),
      token
    };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) {
      throw new ApiError(404, 'Usuário não encontrado para este e-mail.');
    }

    const rawToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = rawToken;
    user.resetPasswordExpires = new Date(Date.now() + (Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_MINUTES || 15) * 60000));
    await user.save();

    return {
      resetToken: rawToken,
      expiresAt: user.resetPasswordExpires,
      note: 'Em produção, envie este token por e-mail ao usuário.'
    };
  }

  async resetPassword(token, novaSenha) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new ApiError(400, 'Token inválido ou expirado.');
    }

    user.senha = novaSenha;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: 'Senha redefinida com sucesso.' };
  }

  async getAuthenticatedUser(userId) {
    const user = await User.findById(userId).select('-senha');
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');
    return user;
  }
}

module.exports = new AuthService();
