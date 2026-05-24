const Atividade = require('../models/Atividade');
const Evento = require('../models/Evento');
const Sala = require('../models/Sala');
const Palestrante = require('../models/Palestrante');
const ApiError = require('../utils/ApiError');

const populateAtividade = (query) => query
  .populate('salaId', 'nome bloco capacidade campusId')
  .populate('palestrantes', 'nome email titulacao instituicao');

const assertReferences = async (payload, eventoId) => {
  const evento = await Evento.findById(eventoId);
  if (!evento) throw new ApiError(404, 'Evento nao encontrado.');

  if (payload.salaId) {
    const sala = await Sala.findById(payload.salaId);
    if (!sala) throw new ApiError(404, 'Sala nao encontrada.');
  }

  if (payload.palestrantes?.length) {
    const total = await Palestrante.countDocuments({ _id: { $in: payload.palestrantes } });
    if (total !== payload.palestrantes.length) {
      throw new ApiError(400, 'Um ou mais palestrantes sao invalidos.');
    }
  }

  return evento;
};

const assertWindow = (payload, evento) => {
  const inicio = new Date(payload.inicio);
  const fim = new Date(payload.fim);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
    throw new ApiError(400, 'Datas e horarios da atividade sao invalidos.');
  }

  if (fim <= inicio) {
    throw new ApiError(400, 'O fim da atividade deve ser posterior ao inicio.');
  }

  const eventoDia = new Date(evento.data);
  const inicioDia = new Date(eventoDia.getFullYear(), eventoDia.getMonth(), eventoDia.getDate());
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

  if (inicio < inicioDia || fim > fimDia) {
    throw new ApiError(400, 'Atividade deve ocorrer no dia do evento.');
  }
};

const sanitizePayload = (payload) => ({
  ...payload,
  descricao: payload.descricao || null,
  salaId: payload.salaId || null,
  salaTexto: payload.salaTexto || null,
  palestrantes: Array.isArray(payload.palestrantes) ? payload.palestrantes : [],
  cargaHoraria: payload.cargaHoraria !== null && payload.cargaHoraria !== undefined && payload.cargaHoraria !== ''
    ? Number(payload.cargaHoraria)
    : null,
  capacidadeMax: payload.capacidadeMax ? Number(payload.capacidadeMax) : null,
  ordem: Number.isInteger(Number(payload.ordem)) ? Number(payload.ordem) : 0
});

const assertOrganizer = (evento, currentUser) => {
  if (!currentUser) throw new ApiError(401, 'Acesso nao autorizado.');
  if (currentUser.tipoPerfil === 'admin') return;
  if (currentUser.tipoPerfil !== 'organizador' || String(evento.organizadorId) !== String(currentUser._id)) {
    throw new ApiError(403, 'Apenas o organizador deste evento pode gerenciar a programacao.');
  }
};

class AtividadeService {
  async create(payload, currentUser) {
    const sanitized = sanitizePayload(payload);
    const evento = await assertReferences(sanitized, sanitized.eventoId);
    assertOrganizer(evento, currentUser);
    assertWindow(sanitized, evento);

    const atividade = await Atividade.create(sanitized);
    return this.findById(atividade._id);
  }

  async findByEvento(eventoId) {
    return populateAtividade(
      Atividade.find({ eventoId }).sort({ inicio: 1, ordem: 1 })
    );
  }

  async findById(id) {
    const atividade = await populateAtividade(Atividade.findById(id));
    if (!atividade) throw new ApiError(404, 'Atividade nao encontrada.');
    return atividade;
  }

  async update(id, payload, currentUser) {
    const atividade = await Atividade.findById(id);
    if (!atividade) throw new ApiError(404, 'Atividade nao encontrada.');

    const sanitized = sanitizePayload({ ...payload, eventoId: String(atividade.eventoId) });
    const evento = await assertReferences(sanitized, atividade.eventoId);
    assertOrganizer(evento, currentUser);
    assertWindow(sanitized, evento);

    Object.assign(atividade, sanitized);
    await atividade.save();
    return this.findById(id);
  }

  async delete(id, currentUser) {
    const atividade = await Atividade.findById(id);
    if (!atividade) throw new ApiError(404, 'Atividade nao encontrada.');

    const evento = await Evento.findById(atividade.eventoId);
    if (!evento) throw new ApiError(404, 'Evento associado nao encontrado.');

    assertOrganizer(evento, currentUser);
    await atividade.deleteOne();
    return null;
  }
}

module.exports = new AtividadeService();
