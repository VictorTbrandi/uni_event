const inscricaoService = require('../services/inscricaoService');
const ApiResponse = require('../utils/ApiResponse');

class InscricaoController {
  async create(req, res) {
    const data = await inscricaoService.create(req.body.eventoId, req.user);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Inscrição realizada com sucesso.',
      data
    });
  }

  async cancel(req, res) {
    const data = await inscricaoService.cancel(req.params.id, req.user);
    return ApiResponse.success(res, {
      message: 'Inscrição cancelada com sucesso.',
      data
    });
  }

  async getMine(req, res) {
    const data = await inscricaoService.getMine(req.user);
    return ApiResponse.success(res, {
      message: 'Inscrições do usuário listadas com sucesso.',
      data
    });
  }
}

module.exports = new InscricaoController();
