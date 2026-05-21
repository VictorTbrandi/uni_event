const eventoService = require('../services/eventoService');
const ApiResponse = require('../utils/ApiResponse');

class EventoController {
  async create(req, res) {
    const data = await eventoService.create(req.body, req.user);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Evento criado com sucesso.',
      data
    });
  }

  async findAll(req, res) {
    const data = await eventoService.findAll();
    return ApiResponse.success(res, {
      message: 'Eventos listados com sucesso.',
      data
    });
  }

  async findById(req, res) {
    const data = await eventoService.findById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Evento encontrado com sucesso.',
      data
    });
  }

  async update(req, res) {
    const data = await eventoService.update(req.params.id, req.body, req.user);
    return ApiResponse.success(res, {
      message: 'Evento atualizado com sucesso.',
      data
    });
  }

  async delete(req, res) {
    await eventoService.delete(req.params.id, req.user);
    return ApiResponse.success(res, {
      message: 'Evento removido com sucesso.',
      data: null
    });
  }

  async getParticipants(req, res) {
    const data = await eventoService.getParticipants(req.params.id, req.user);
    return ApiResponse.success(res, {
      message: 'Participantes listados com sucesso.',
      data
    });
  }
}

module.exports = new EventoController();
