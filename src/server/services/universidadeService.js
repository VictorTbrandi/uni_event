const Universidade = require('../models/Universidade');
const Campus = require('../models/Campus');
const Departamento = require('../models/Departamento');
const Curso = require('../models/Curso');
const ApiError = require('../utils/ApiError');

class UniversidadeService {
  async create(payload) {
    return Universidade.create(payload);
  }

  async findAll() {
    return Universidade.find().sort({ nome: 1 });
  }

  async findById(id) {
    const universidade = await Universidade.findById(id);
    if (!universidade) throw new ApiError(404, 'Universidade nao encontrada.');
    return universidade;
  }

  async update(id, payload) {
    const universidade = await Universidade.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!universidade) throw new ApiError(404, 'Universidade nao encontrada.');
    return universidade;
  }

  async delete(id) {
    const universidade = await Universidade.findById(id);
    if (!universidade) throw new ApiError(404, 'Universidade nao encontrada.');

    const [campi, departamentos, cursos] = await Promise.all([
      Campus.countDocuments({ universidadeId: id }),
      Departamento.countDocuments({ universidadeId: id }),
      Curso.countDocuments({ universidadeId: id })
    ]);

    if (campi + departamentos + cursos > 0) {
      throw new ApiError(
        409,
        'Nao e possivel excluir uma universidade que possui campi, departamentos ou cursos vinculados.'
      );
    }

    await universidade.deleteOne();
    return null;
  }
}

module.exports = new UniversidadeService();
