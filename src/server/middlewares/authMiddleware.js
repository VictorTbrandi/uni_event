const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Token não informado.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-senha');

    if (!user || !user.ativo) {
      return next(new ApiError(401, 'Usuário inválido ou inativo.'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Token inválido ou expirado.'));
  }
};
