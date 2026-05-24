const Departamento = require('../models/Departamento');
const Universidade = require('../models/Universidade');
const Curso = require('../models/Curso');
const ApiError = require('../utils/ApiError');

const assertUniversidade = async (universidadeId) => {
  const universidade = await Universidade.findById(universidadeId);
  if (!universidade) throw new ApiError(404, 'Universidade nao encontrada.');
  return universidade;
};

class DepartamentoService {
  async create(payload) {
    await assertUniversidade(payload.universidadeId);
    return Departamento.create(payload);
  }

  async findAll({ universidadeId } = {}) {
    const filter = universidadeId ? { universidadeId } : {};
    return Departamento.find(filter)
      .populate('universidadeId', 'nome sigla')
      .sort({ nome: 1 });
  }

  async findById(id) {
    const departamento = await Departamento.findById(id).populate('universidadeId', 'nome sigla');
    if (!departamento) throw new ApiError(404, 'Departamento nao encontrado.');
    return departamento;
  }

  async update(id, payload) {
    if (payload.universidadeId) await assertUniversidade(payload.universidadeId);

    const departamento = await Departamento.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate('universidadeId', 'nome sigla');
    if (!departamento) throw new ApiError(404, 'Departamento nao encontrado.');
    return departamento;
  }

  async delete(id) {
    const departamento = await Departamento.findById(id);
    if (!departamento) throw new ApiError(404, 'Departamento nao encontrado.');

    const cursosVinculados = await Curso.countDocuments({ departamentoId: id });
    if (cursosVinculados > 0) {
      throw new ApiError(409, 'Nao e possivel excluir um departamento com cursos vinculados.');
    }

    await departamento.deleteOne();
    return null;
  }
}

module.exports = new DepartamentoService();
