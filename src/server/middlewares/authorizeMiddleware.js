const ApiError = require('../utils/ApiError');

module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Usuário não autenticado.'));
    }

    if (!roles.includes(req.user.tipoPerfil)) {
      return next(new ApiError(403, 'Acesso negado para este perfil.'));
    }

    next();
  };
};
