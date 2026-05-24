const cursoService = require('../services/cursoService');
const ApiResponse = require('../utils/ApiResponse');

class CursoController {
  async create(req, res) {
    const data = await cursoService.create(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Curso cadastrado com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await cursoService.findAll({
      universidadeId: req.query.universidadeId,
      departamentoId: req.query.departamentoId
    });
    return ApiResponse.success(res, {
      message: 'Cursos listados com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await cursoService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Curso encontrado com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await cursoService.update(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Curso atualizado com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await cursoService.delete(req.params.id);
    return ApiResponse.success(res, {
      message: 'Curso removido com sucesso.',
      data: null
    });
  }
}

module.exports = new CursoController();
