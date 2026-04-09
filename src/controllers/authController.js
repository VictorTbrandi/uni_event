const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  async register(req, res) {
    const data = await authService.register(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Usuário cadastrado com sucesso.',
      data
    });
  }

  async login(req, res) {
    const data = await authService.login(req.body.email, req.body.senha);
    return ApiResponse.success(res, {
      message: 'Login realizado com sucesso.',
      data
    });
  }

  async forgotPassword(req, res) {
    const data = await authService.forgotPassword(req.body.email);
    return ApiResponse.success(res, {
      message: 'Token de redefinição gerado com sucesso.',
      data
    });
  }

  async resetPassword(req, res) {
    const data = await authService.resetPassword(req.body.token, req.body.novaSenha);
    return ApiResponse.success(res, {
      message: data.message,
      data: null
    });
  }

  async me(req, res) {
    const data = await authService.getAuthenticatedUser(req.user._id);
    return ApiResponse.success(res, {
      message: 'Perfil autenticado retornado com sucesso.',
      data
    });
  }
}

module.exports = new AuthController();
