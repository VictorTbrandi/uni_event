const iaService = require('../services/iaService');
const ApiResponse = require('../utils/ApiResponse');

class IAController {
  async resumirFeedbacks(req, res) {
    const data = await iaService.resumirFeedbacks(req.body.eventoId);
    return ApiResponse.success(res, {
      message: 'Resumo de feedbacks gerado com sucesso.',
      data
    });
  }

  async classificarSatisfacao(req, res) {
    const data = await iaService.classificarSatisfacao(req.body.eventoId);
    return ApiResponse.success(res, {
      message: 'Classificação de satisfação gerada com sucesso.',
      data
    });
  }

  async sugerirDescricaoEvento(req, res) {
    const data = await iaService.sugerirDescricaoEvento(req.body);
    return ApiResponse.success(res, {
      message: 'Descrição sugerida com sucesso.',
      data
    });
  }
}

module.exports = new IAController();
