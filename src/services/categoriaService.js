const Categoria = require('../models/Categoria');
const ApiError = require('../utils/ApiError');

class CategoriaService {
  async create(payload) {
    return Categoria.create(payload);
  }

  async findAll() {
    return Categoria.find().sort({ nome: 1 });
  }

  async findById(id) {
    const categoria = await Categoria.findById(id);
    if (!categoria) throw new ApiError(404, 'Categoria não encontrada.');
    return categoria;
  }

  async update(id, payload) {
    const categoria = await Categoria.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!categoria) throw new ApiError(404, 'Categoria não encontrada.');
    return categoria;
  }

  async delete(id) {
    const categoria = await Categoria.findById(id);
    if (!categoria) throw new ApiError(404, 'Categoria não encontrada.');
    await categoria.deleteOne();
    return null;
  }
}

module.exports = new CategoriaService();
