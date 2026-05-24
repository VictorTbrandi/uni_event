const Curso = require('../models/Curso');
const Universidade = require('../models/Universidade');
const Departamento = require('../models/Departamento');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const assertReferences = async (payload) => {
  const universidade = await Universidade.findById(payload.universidadeId);
  if (!universidade) throw new ApiError(404, 'Universidade nao encontrada.');

  if (payload.departamentoId) {
    const departamento = await Departamento.findById(payload.departamentoId);
    if (!departamento) throw new ApiError(404, 'Departamento nao encontrado.');
    if (String(departamento.universidadeId) !== String(payload.universidadeId)) {
      throw new ApiError(400, 'O departamento informado nao pertence a universidade selecionada.');
    }
  }

  if (payload.coordenadorId) {
    const coordenador = await User.findById(payload.coordenadorId);
    if (!coordenador) throw new ApiError(404, 'Coordenador nao encontrado.');
  }
};

const sanitizePayload = (payload) => ({
  ...payload,
  departamentoId: payload.departamentoId || null,
  coordenadorId: payload.coordenadorId || null,
  cargaHorariaTotal: payload.cargaHorariaTotal ? Number(payload.cargaHorariaTotal) : null,
  duracaoSemestres: payload.duracaoSemestres ? Number(payload.duracaoSemestres) : null
});

class CursoService {
  async create(payload) {
    const sanitized = sanitizePayload(payload);
    await assertReferences(sanitized);
    const curso = await Curso.create(sanitized);
    return this.findById(curso._id);
  }

  async findAll({ universidadeId, departamentoId } = {}) {
    const filter = {};
    if (universidadeId) filter.universidadeId = universidadeId;
    if (departamentoId) filter.departamentoId = departamentoId;

    return Curso.find(filter)
      .populate('universidadeId', 'nome sigla')
      .populate('departamentoId', 'nome sigla')
      .populate('coordenadorId', 'nome email')
      .sort({ nome: 1 });
  }

  async findById(id) {
    const curso = await Curso.findById(id)
      .populate('universidadeId', 'nome sigla')
      .populate('departamentoId', 'nome sigla')
      .populate('coordenadorId', 'nome email');
    if (!curso) throw new ApiError(404, 'Curso nao encontrado.');
    return curso;
  }

  async update(id, payload) {
    const sanitized = sanitizePayload(payload);
    await assertReferences(sanitized);

    const curso = await Curso.findByIdAndUpdate(id, sanitized, { new: true, runValidators: true })
      .populate('universidadeId', 'nome sigla')
      .populate('departamentoId', 'nome sigla')
      .populate('coordenadorId', 'nome email');
    if (!curso) throw new ApiError(404, 'Curso nao encontrado.');
    return curso;
  }

  async delete(id) {
    const curso = await Curso.findById(id);
    if (!curso) throw new ApiError(404, 'Curso nao encontrado.');
    await curso.deleteOne();
    return null;
  }
}

module.exports = new CursoService();
