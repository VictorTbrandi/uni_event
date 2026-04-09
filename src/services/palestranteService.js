const Palestrante = require('../models/Palestrante');
const ApiError = require('../utils/ApiError');

class PalestranteService {
  async create(payload) {
    return Palestrante.create(payload);
  }

  async findAll() {
    return Palestrante.find().sort({ nome: 1 });
  }

  async findById(id) {
    const palestrante = await Palestrante.findById(id);
    if (!palestrante) throw new ApiError(404, 'Palestrante não encontrado.');
    return palestrante;
  }

  async update(id, payload) {
    const palestrante = await Palestrante.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!palestrante) throw new ApiError(404, 'Palestrante não encontrado.');
    return palestrante;
  }

  async delete(id) {
    const palestrante = await Palestrante.findById(id);
    if (!palestrante) throw new ApiError(404, 'Palestrante não encontrado.');
    await palestrante.deleteOne();
    return null;
  }
}

module.exports = new PalestranteService();
