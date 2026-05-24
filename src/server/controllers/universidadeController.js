const universidadeService = require('../services/universidadeService');
const ApiResponse = require('../utils/ApiResponse');

class UniversidadeController {
  async create(req, res) {
    const data = await universidadeService.create(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Universidade cadastrada com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await universidadeService.findAll();
    return ApiResponse.success(res, {
      message: 'Universidades listadas com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await universidadeService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Universidade encontrada com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await universidadeService.update(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Universidade atualizada com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await universidadeService.delete(req.params.id);
    return ApiResponse.success(res, {
      message: 'Universidade removida com sucesso.',
      data: null
    });
  }
}

module.exports = new UniversidadeController();
