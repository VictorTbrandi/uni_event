const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const Categoria = require('../models/Categoria');
const Palestrante = require('../models/Palestrante');
const ApiError = require('../utils/ApiError');

class EventoService {
  async create(payload, currentUser) {
    const categoria = await Categoria.findById(payload.categoriaId);
    if (!categoria) throw new ApiError(404, 'Categoria não encontrada.');

    if (payload.palestrantes?.length) {
      const total = await Palestrante.countDocuments({ _id: { $in: payload.palestrantes } });
      if (total !== payload.palestrantes.length) {
        throw new ApiError(400, 'Um ou mais palestrantes são inválidos.');
      }
    }

    return Evento.create({
      ...payload,
      organizadorId: currentUser._id
    });
  }

  async findAll() {
    return Evento.find()
      .populate('categoriaId', 'nome')
      .populate('palestrantes', 'nome email instituicao')
      .populate('organizadorId', 'nome email')
      .sort({ data: 1, horarioInicio: 1 });
  }

  async findById(id) {
    const evento = await Evento.findById(id)
      .populate('categoriaId', 'nome descricao')
      .populate('palestrantes', 'nome email instituicao areaAtuacao')
      .populate('organizadorId', 'nome email');

    if (!evento) throw new ApiError(404, 'Evento não encontrado.');
    return evento;
  }

  async update(id, payload, currentUser) {
    const evento = await Evento.findById(id);
    if (!evento) throw new ApiError(404, 'Evento não encontrado.');

    const isOwner = String(evento.organizadorId) === String(currentUser._id);
    if (currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Você não pode alterar este evento.');
    }

    Object.assign(evento, payload);
    await evento.save();
    return this.findById(id);
  }

  async delete(id, currentUser) {
    const evento = await Evento.findById(id);
    if (!evento) throw new ApiError(404, 'Evento não encontrado.');

    const isOwner = String(evento.organizadorId) === String(currentUser._id);
    if (currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Você não pode excluir este evento.');
    }

    await evento.deleteOne();
    return null;
  }

  async getParticipants(eventoId, currentUser) {
    const evento = await Evento.findById(eventoId);
    if (!evento) throw new ApiError(404, 'Evento não encontrado.');

    const isOwner = String(evento.organizadorId) === String(currentUser._id);
    if (!['admin', 'organizador'].includes(currentUser.tipoPerfil)) {
      throw new ApiError(403, 'Acesso negado.');
    }

    if (currentUser.tipoPerfil === 'organizador' && !isOwner) {
      throw new ApiError(403, 'Você só pode consultar inscritos dos seus eventos.');
    }

    return Inscricao.find({ eventoId })
      .populate('usuarioId', 'nome email curso ra')
      .sort({ createdAt: -1 });
  }
}

module.exports = new EventoService();
