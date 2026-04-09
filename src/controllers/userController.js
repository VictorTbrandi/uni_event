const userService = require('../services/userService');
const ApiResponse = require('../utils/ApiResponse');

class UserController {
  async create(req, res) {
    const data = await userService.create(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Usuário criado com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await userService.findAll();
    return ApiResponse.success(res, {
      message: 'Usuários listados com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await userService.findById(req.params.id, req.user);
    return ApiResponse.success(res, {
      message: 'Usuário encontrado com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await userService.update(req.params.id, req.body, req.user);
    return ApiResponse.success(res, {
      message: 'Usuário atualizado com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await userService.delete(req.params.id);
    return ApiResponse.success(res, {
      message: 'Usuário removido com sucesso.',
      data: null
    });
  }
}

module.exports = new UserController();
