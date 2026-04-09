const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const pickAllowedFields = require('../utils/pickAllowedFields');

class UserService {
  async create(payload) {
    const exists = await User.findOne({ email: payload.email.toLowerCase() });
    if (exists) throw new ApiError(409, 'E-mail já cadastrado.');
    return User.create(payload);
  }

  async findAll() {
    return User.find().select('-senha').sort({ nome: 1 });
  }

  async findById(id, currentUser) {
    if (currentUser.tipoPerfil !== 'admin' && String(currentUser._id) !== String(id)) {
      throw new ApiError(403, 'Você só pode visualizar seu próprio perfil.');
    }

    const user = await User.findById(id).select('-senha');
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');
    return user;
  }

  async update(id, payload, currentUser) {
    const user = await User.findById(id).select('+senha');
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');

    if (currentUser.tipoPerfil !== 'admin' && String(currentUser._id) !== String(id)) {
      throw new ApiError(403, 'Você não pode editar outro usuário.');
    }

    const allowed = currentUser.tipoPerfil === 'admin'
      ? ['nome', 'email', 'tipoPerfil', 'curso', 'ra', 'ativo']
      : ['nome', 'email', 'curso', 'ra'];

    const data = pickAllowedFields(payload, allowed);
    Object.assign(user, data);
    await user.save();

    return User.findById(id).select('-senha');
  }

  async delete(id) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');
    await user.deleteOne();
    return null;
  }
}

module.exports = new UserService();
