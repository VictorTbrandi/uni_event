const departamentoService = require('../services/departamentoService');
const ApiResponse = require('../utils/ApiResponse');

class DepartamentoController {
  async create(req, res) {
    const data = await departamentoService.create(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Departamento cadastrado com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await departamentoService.findAll({ universidadeId: req.query.universidadeId });
    return ApiResponse.success(res, {
      message: 'Departamentos listados com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await departamentoService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Departamento encontrado com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await departamentoService.update(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Departamento atualizado com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await departamentoService.delete(req.params.id);
    return ApiResponse.success(res, {
      message: 'Departamento removido com sucesso.',
      data: null
    });
  }
}

module.exports = new DepartamentoController();
