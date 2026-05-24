const campusService = require('../services/campusService');
const ApiResponse = require('../utils/ApiResponse');

class CampusController {
  async create(req, res) {
    const data = await campusService.create(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Campus cadastrado com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await campusService.findAll({ universidadeId: req.query.universidadeId });
    return ApiResponse.success(res, {
      message: 'Campi listados com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await campusService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Campus encontrado com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await campusService.update(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Campus atualizado com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await campusService.delete(req.params.id);
    return ApiResponse.success(res, {
      message: 'Campus removido com sucesso.',
      data: null
    });
  }
}

module.exports = new CampusController();
