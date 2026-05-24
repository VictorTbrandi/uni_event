const atividadeService = require('../services/atividadeService');
const ApiResponse = require('../utils/ApiResponse');

class AtividadeController {
  async create(req, res) {
    const data = await atividadeService.create(req.body, req.user);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Atividade cadastrada com sucesso.',
      data
    });
  }

  async findByEvento(req, res) {
    const data = await atividadeService.findByEvento(req.params.eventoId);
    return ApiResponse.success(res, {
      message: 'Atividades listadas com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await atividadeService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Atividade encontrada com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await atividadeService.update(req.params.id, req.body, req.user);
    return ApiResponse.success(res, {
      message: 'Atividade atualizada com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await atividadeService.delete(req.params.id, req.user);
    return ApiResponse.success(res, {
      message: 'Atividade removida com sucesso.',
      data: null
    });
  }
}

module.exports = new AtividadeController();
