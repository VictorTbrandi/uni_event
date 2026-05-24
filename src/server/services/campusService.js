const Campus = require('../models/Campus');
const Universidade = require('../models/Universidade');
const ApiError = require('../utils/ApiError');

const assertUniversidade = async (universidadeId) => {
  const universidade = await Universidade.findById(universidadeId);
  if (!universidade) throw new ApiError(404, 'Universidade nao encontrada.');
  return universidade;
};

class CampusService {
  async create(payload) {
    await assertUniversidade(payload.universidadeId);
    return Campus.create(payload);
  }

  async findAll({ universidadeId } = {}) {
    const filter = universidadeId ? { universidadeId } : {};
    return Campus.find(filter)
      .populate('universidadeId', 'nome sigla')
      .sort({ nome: 1 });
  }

  async findById(id) {
    const campus = await Campus.findById(id).populate('universidadeId', 'nome sigla');
    if (!campus) throw new ApiError(404, 'Campus nao encontrado.');
    return campus;
  }

  async update(id, payload) {
    if (payload.universidadeId) await assertUniversidade(payload.universidadeId);

    const campus = await Campus.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate('universidadeId', 'nome sigla');
    if (!campus) throw new ApiError(404, 'Campus nao encontrado.');
    return campus;
  }

  async delete(id) {
    const campus = await Campus.findById(id);
    if (!campus) throw new ApiError(404, 'Campus nao encontrado.');
    await campus.deleteOne();
    return null;
  }
}

module.exports = new CampusService();
