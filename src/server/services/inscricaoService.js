const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const ApiError = require('../utils/ApiError');

class InscricaoService {
  async create(eventoId, currentUser) {
    const evento = await Evento.findById(eventoId);
    if (!evento || !evento.ativo) throw new ApiError(404, 'Evento não encontrado ou inativo.');
    if (evento.status !== 'aberto') throw new ApiError(400, 'Este evento não está aberto para inscrições.');

    const existing = await Inscricao.findOne({ usuarioId: currentUser._id, eventoId });
    if (existing) throw new ApiError(409, 'Você já possui inscrição para este evento.');

    const totalInscritos = await Inscricao.countDocuments({ eventoId, status: { $ne: 'cancelada' } });
    if (totalInscritos >= evento.vagas) {
      throw new ApiError(400, 'Não há vagas disponíveis para este evento.');
    }

    return Inscricao.create({ usuarioId: currentUser._id, eventoId });
  }

  async cancel(inscricaoId, currentUser) {
    const inscricao = await Inscricao.findById(inscricaoId);
    if (!inscricao) throw new ApiError(404, 'Inscrição não encontrada.');

    const isOwner = String(inscricao.usuarioId) === String(currentUser._id);
    if (currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Você não pode cancelar esta inscrição.');
    }

    inscricao.status = 'cancelada';
    await inscricao.save();
    return inscricao;
  }

  async getMine(currentUser) {
    return Inscricao.find({ usuarioId: currentUser._id })
      .populate('eventoId', 'titulo data horarioInicio horarioFim local status')
      .sort({ createdAt: -1 });
  }
}

module.exports = new InscricaoService();
