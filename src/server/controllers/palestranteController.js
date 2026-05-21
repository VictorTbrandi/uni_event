const palestranteService = require('../services/palestranteService');
const ApiResponse = require('../utils/ApiResponse');

class PalestranteController {
  async create(req, res) {
    const data = await palestranteService.create(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Palestrante criado com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await palestranteService.findAll();
    return ApiResponse.success(res, {
      message: 'Palestrantes listados com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await palestranteService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Palestrante encontrado com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await palestranteService.update(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Palestrante atualizado com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await palestranteService.delete(req.params.id);
    return ApiResponse.success(res, {
      message: 'Palestrante removido com sucesso.',
      data: null
    });
  }
}

module.exports = new PalestranteController();
