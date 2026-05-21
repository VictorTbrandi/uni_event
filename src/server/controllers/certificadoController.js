const certificadoService = require('../services/certificadoService');
const ApiResponse = require('../utils/ApiResponse');

class CertificadoController {
  async emitir(req, res) {
    const data = await certificadoService.emitir(req.body, req.user);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Certificado emitido com sucesso.',
      data
    });
  }

  async getMine(req, res) {
    const data = await certificadoService.getMine(req.user);
    return ApiResponse.success(res, {
      message: 'Certificados do usuário listados com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await certificadoService.findById(req.params.id, req.user);
    return ApiResponse.success(res, {
      message: 'Certificado encontrado com sucesso.',
      data
    });
  }
}

module.exports = new CertificadoController();
