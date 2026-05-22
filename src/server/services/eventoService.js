const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const Categoria = require('../models/Categoria');
const Palestrante = require('../models/Palestrante');
const ApiError = require('../utils/ApiError');
const openMeteoGeocodingService = require('./openMeteoGeocodingService');
const previsaoTempoService = require('./previsaoTempoService');
const {
  combineDateAndTime,
  normalizeBaseStatus,
  toPublicEvento
} = require('../utils/eventLifecycle');

const activeSubscriptionFilter = { status: { $ne: 'cancelada' } };

const canSeeClosedEvents = (currentUser) => ['admin', 'organizador'].includes(currentUser?.tipoPerfil);
const createStatusOptions = ['aberto', 'fechado'];
const updateStatusOptions = ['aberto', 'fechado', 'cancelado'];

const sanitizePayload = (payload) => {
  const previsaoTempoAtiva = payload.previsaoTempoAtiva === true || payload.previsaoTempoAtiva === 'true';
  const sanitized = {
    ...payload,
    status: normalizeBaseStatus(payload.status),
    palestrantes: Array.isArray(payload.palestrantes) ? payload.palestrantes : [],
    inscricoesEncerramEm: payload.inscricoesEncerramEm || null,
    previsaoTempoAtiva,
    cidade: payload.cidade ? String(payload.cidade).trim() : null,
    uf: payload.uf ? String(payload.uf).trim().toUpperCase() : null,
    latitude: null,
    longitude: null
  };

  if (sanitized.status !== 'aberto') {
    sanitized.inscricoesEncerramEm = null;
  }

  return sanitized;
};

const assertStatusRules = (status, allowedStatuses, message) => {
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, message);
  }
};

const assertScheduleRules = (payload) => {
  const inicio = combineDateAndTime(payload.data, payload.horarioInicio);
  const fim = combineDateAndTime(payload.data, payload.horarioFim);
  const now = new Date();
  now.setSeconds(0, 0);

  if (!inicio || !fim) {
    throw new ApiError(400, 'Data e horarios do evento sao invalidos.');
  }

  if (inicio < now) {
    throw new ApiError(400, 'Nao e permitido cadastrar ou editar eventos com data e hora retroativas.');
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

  async hasActiveSubscription(eventoId, currentUser) {
    if (!currentUser?._id) return false;

    const inscricao = await Inscricao.findOne({
      eventoId,
      usuarioId: currentUser._id,
      ...activeSubscriptionFilter
    }).select('_id');

    return Boolean(inscricao);
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

  async applyWeatherLocation(sanitized) {
    if (!sanitized.previsaoTempoAtiva) {
      sanitized.latitude = null;
      sanitized.longitude = null;
      return sanitized;
    }

    if (!sanitized.cidade || !sanitized.uf) {
      throw new ApiError(400, 'Informe cidade e UF para consultar a previsao do tempo.');
    }

    const location = await openMeteoGeocodingService.buscarCoordenadas(sanitized.cidade, sanitized.uf);
    sanitized.cidade = location.cidade;
    sanitized.uf = location.uf;
    sanitized.latitude = location.latitude;
    sanitized.longitude = location.longitude;
    return sanitized;
  }

  async previewRainForecast(payload) {
    const cidade = payload.cidade ? String(payload.cidade).trim() : null;
    const uf = payload.uf ? String(payload.uf).trim().toUpperCase() : null;

    if (!cidade || !uf) {
      throw new ApiError(400, 'Informe cidade e UF para consultar a previsao do tempo.');
    }

    if (!payload.data || !payload.horarioInicio) {
      throw new ApiError(400, 'Informe data e horario de inicio para consultar a previsao do tempo.');
    }

    const location = await openMeteoGeocodingService.buscarCoordenadas(cidade, uf);
    const previewEvent = {
      _id: null,
      titulo: payload.titulo || 'Previa do evento',
      data: payload.data,
      horarioInicio: payload.horarioInicio,
      horarioFim: payload.horarioFim || payload.horarioInicio,
      status: 'aberto',
      vagas: 1,
      inscricoesEncerramEm: null,
      previsaoTempoAtiva: true,
      cidade: location.cidade,
      uf: location.uf,
      latitude: location.latitude,
      longitude: location.longitude
    };

    return previsaoTempoService.getPrevisaoChuva(previewEvent, 0);
  }

  async create(payload, currentUser) {
    const sanitized = sanitizePayload(payload);
    assertStatusRules(
      sanitized.status,
      createStatusOptions,
      'Ao cadastrar um evento, as inscricoes devem estar abertas ou fechadas.'
    );
    assertScheduleRules(sanitized);
    await this.assertReferences(sanitized);
    await this.applyWeatherLocation(sanitized);

    const evento = await Evento.create({
      ...sanitized,
      organizadorId: currentUser?._id || null
    });

    return this.findById(evento._id, currentUser);
  }

  async findAll(currentUser = null) {
    const eventos = await Evento.find()
      .populate('categoriaId', 'nome')
      .populate('palestrantes', 'nome email instituicao')
      .populate('organizadorId', 'nome email')
      .sort({ data: 1, horarioInicio: 1 });

    const enriched = await Promise.all(eventos.map((evento) => this.enrich(evento)));

    if (canSeeClosedEvents(currentUser)) {
      return enriched;
    }

    return enriched.filter((evento) => evento.status === 'aberto');
  }

  async findById(id, currentUser = null) {
    const evento = await Evento.findById(id)
      .populate('categoriaId', 'nome descricao')
      .populate('palestrantes', 'nome email instituicao areaAtuacao')
      .populate('organizadorId', 'nome email');

    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');
    const enriched = await this.enrich(evento);

    const canSeeAsSubscriber = await this.hasActiveSubscription(evento._id, currentUser);
    if (!canSeeClosedEvents(currentUser) && !canSeeAsSubscriber && enriched.status !== 'aberto') {
      throw new ApiError(404, 'Evento nao encontrado.');
    }

    return enriched;
  }

  async update(id, payload, currentUser) {
    const evento = await Evento.findById(id);
    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');

    const isOwner = currentUser && String(evento.organizadorId) === String(currentUser._id);
    if (currentUser && currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Voce nao pode alterar este evento.');
    }

    const sanitized = sanitizePayload(payload);
    assertStatusRules(
      sanitized.status,
      updateStatusOptions,
      'Ao editar um evento, use inscricoes abertas, fechadas ou evento cancelado.'
    );
    assertScheduleRules(sanitized);
    await this.assertReferences(sanitized);
    await this.applyWeatherLocation(sanitized);

    Object.assign(evento, sanitized);
    await evento.save();
    return this.findById(id, currentUser);
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

  async getRainForecast(id, currentUser = null) {
    const evento = await Evento.findById(id);
    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');

    const enriched = await this.enrich(evento);
    const canSeeAsSubscriber = await this.hasActiveSubscription(evento._id, currentUser);
    if (!canSeeClosedEvents(currentUser) && !canSeeAsSubscriber && enriched.status !== 'aberto') {
      throw new ApiError(404, 'Evento nao encontrado.');
    }

    const inscritosCount = await this.countActiveSubscriptions(evento._id);
    return previsaoTempoService.getPrevisaoChuva(evento, inscritosCount);
  }
}

module.exports = new EventoService();
