const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const Categoria = require('../models/Categoria');
const Palestrante = require('../models/Palestrante');
const ApiError = require('../utils/ApiError');
const {
  combineDateAndTime,
  normalizeBaseStatus,
  toPublicEvento
} = require('../utils/eventLifecycle');

const activeSubscriptionFilter = { status: { $ne: 'cancelada' } };

const sanitizePayload = (payload) => {
  const sanitized = {
    ...payload,
    status: normalizeBaseStatus(payload.status),
    inscricoesEncerramEm: payload.inscricoesEncerramEm || null
  };

  if (sanitized.status !== 'aberto') {
    sanitized.inscricoesEncerramEm = null;
  }

  return sanitized;
};

const assertScheduleRules = (payload) => {
  const inicio = combineDateAndTime(payload.data, payload.horarioInicio);
  const fim = combineDateAndTime(payload.data, payload.horarioFim);

  if (!inicio || !fim) {
    throw new ApiError(400, 'Data e horarios do evento sao invalidos.');
  }

  if (fim <= inicio) {
    throw new ApiError(400, 'O horario final deve ser posterior ao horario inicial.');
  }

  if (payload.status !== 'aberto') return;

  if (!payload.inscricoesEncerramEm) {
    throw new ApiError(400, 'Informe quando as inscricoes serao encerradas para abrir o evento.');
  }

  const encerramentoInscricoes = new Date(payload.inscricoesEncerramEm);
  if (Number.isNaN(encerramentoInscricoes.getTime())) {
    throw new ApiError(400, 'Encerramento das inscricoes invalido.');
  }

  if (encerramentoInscricoes <= new Date()) {
    throw new ApiError(400, 'Para abrir inscricoes, informe um encerramento futuro.');
  }

  if (encerramentoInscricoes >= fim) {
    throw new ApiError(400, 'As inscricoes devem encerrar antes do fim do evento.');
  }
};

class EventoService {
  async countActiveSubscriptions(eventoId) {
    return Inscricao.countDocuments({ eventoId, ...activeSubscriptionFilter });
  }

  async enrich(evento) {
    const inscritosCount = await this.countActiveSubscriptions(evento._id);
    return toPublicEvento(evento, inscritosCount);
  }

  async assertReferences(payload) {
    const categoria = await Categoria.findById(payload.categoriaId);
    if (!categoria) throw new ApiError(404, 'Categoria nao encontrada.');

    if (payload.palestrantes?.length) {
      const total = await Palestrante.countDocuments({ _id: { $in: payload.palestrantes } });
      if (total !== payload.palestrantes.length) {
        throw new ApiError(400, 'Um ou mais palestrantes sao invalidos.');
      }
    }
  }

  async create(payload, currentUser) {
    const sanitized = sanitizePayload(payload);
    assertScheduleRules(sanitized);
    await this.assertReferences(sanitized);

    const evento = await Evento.create({
      ...sanitized,
      organizadorId: currentUser?._id || null
    });

    return this.findById(evento._id);
  }

  async findAll() {
    const eventos = await Evento.find()
      .populate('categoriaId', 'nome')
      .populate('palestrantes', 'nome email instituicao')
      .populate('organizadorId', 'nome email')
      .sort({ data: 1, horarioInicio: 1 });

    return Promise.all(eventos.map((evento) => this.enrich(evento)));
  }

  async findById(id) {
    const evento = await Evento.findById(id)
      .populate('categoriaId', 'nome descricao')
      .populate('palestrantes', 'nome email instituicao areaAtuacao')
      .populate('organizadorId', 'nome email');

    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');
    return this.enrich(evento);
  }

  async update(id, payload, currentUser) {
    const evento = await Evento.findById(id);
    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');

    const isOwner = currentUser && String(evento.organizadorId) === String(currentUser._id);
    if (currentUser && currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Voce nao pode alterar este evento.');
    }

    const sanitized = sanitizePayload(payload);
    assertScheduleRules(sanitized);
    await this.assertReferences(sanitized);

    Object.assign(evento, sanitized);
    await evento.save();
    return this.findById(id);
  }

  async delete(id, currentUser) {
    const evento = await Evento.findById(id);
    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');

    const isOwner = currentUser && String(evento.organizadorId) === String(currentUser._id);
    if (currentUser && currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Voce nao pode excluir este evento.');
    }

    await evento.deleteOne();
    return null;
  }

  async getParticipants(eventoId, currentUser) {
    const evento = await Evento.findById(eventoId);
    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');

    const isOwner = String(evento.organizadorId) === String(currentUser._id);
    if (!['admin', 'organizador'].includes(currentUser.tipoPerfil)) {
      throw new ApiError(403, 'Acesso negado.');
    }

    if (currentUser.tipoPerfil === 'organizador' && !isOwner) {
      throw new ApiError(403, 'Voce so pode consultar inscritos dos seus eventos.');
    }

    return Inscricao.find({ eventoId })
      .populate('usuarioId', 'nome email curso ra')
      .sort({ createdAt: -1 });
  }
}

module.exports = new EventoService();
