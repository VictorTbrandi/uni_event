const Sala = require('../models/Sala');
const Universidade = require('../models/Universidade');
const Campus = require('../models/Campus');
const ApiError = require('../utils/ApiError');

const assertReferences = async (payload) => {
  const universidade = await Universidade.findById(payload.universidadeId);
  if (!universidade) throw new ApiError(404, 'Universidade nao encontrada.');

  if (payload.campusId) {
    const campus = await Campus.findById(payload.campusId);
    if (!campus) throw new ApiError(404, 'Campus nao encontrado.');
    if (String(campus.universidadeId) !== String(payload.universidadeId)) {
      throw new ApiError(400, 'O campus informado nao pertence a universidade selecionada.');
    }
  }
};

const sanitizePayload = (payload) => ({
  ...payload,
  campusId: payload.campusId || null,
  bloco: payload.bloco || null,
  observacoes: payload.observacoes || null,
  recursos: Array.isArray(payload.recursos) ? payload.recursos : [],
  capacidade: Number(payload.capacidade)
});

class SalaService {
  async create(payload) {
    const sanitized = sanitizePayload(payload);
    await assertReferences(sanitized);
    const sala = await Sala.create(sanitized);
    return this.findById(sala._id);
  }

  async findAll({ universidadeId, campusId } = {}) {
    const filter = {};
    if (universidadeId) filter.universidadeId = universidadeId;
    if (campusId) filter.campusId = campusId;

    return Sala.find(filter)
      .populate('universidadeId', 'nome sigla')
      .populate('campusId', 'nome sigla cidade uf')
      .sort({ nome: 1 });
  }

  async findById(id) {
    const sala = await Sala.findById(id)
      .populate('universidadeId', 'nome sigla')
      .populate('campusId', 'nome sigla cidade uf');
    if (!sala) throw new ApiError(404, 'Sala nao encontrada.');
    return sala;
  }

  async update(id, payload) {
    const sanitized = sanitizePayload(payload);
    await assertReferences(sanitized);

    const sala = await Sala.findByIdAndUpdate(id, sanitized, { new: true, runValidators: true })
      .populate('universidadeId', 'nome sigla')
      .populate('campusId', 'nome sigla cidade uf');
    if (!sala) throw new ApiError(404, 'Sala nao encontrada.');
    return sala;
  }

  async delete(id) {
    const sala = await Sala.findById(id);
    if (!sala) throw new ApiError(404, 'Sala nao encontrada.');
    await sala.deleteOne();
    return null;
  }
}

module.exports = new SalaService();
