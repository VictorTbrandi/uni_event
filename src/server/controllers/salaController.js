const salaService = require('../services/salaService');
const ApiResponse = require('../utils/ApiResponse');

class SalaController {
  async create(req, res) {
    const data = await salaService.create(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Sala cadastrada com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await salaService.findAll({
      universidadeId: req.query.universidadeId,
      campusId: req.query.campusId
    });
    return ApiResponse.success(res, {
      message: 'Salas listadas com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await salaService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Sala encontrada com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await salaService.update(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Sala atualizada com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await salaService.delete(req.params.id);
    return ApiResponse.success(res, {
      message: 'Sala removida com sucesso.',
      data: null
    });
  }
}

module.exports = new SalaController();
