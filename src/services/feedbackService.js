const Feedback = require('../models/Feedback');
const Inscricao = require('../models/Inscricao');
const Evento = require('../models/Evento');
const ApiError = require('../utils/ApiError');

class FeedbackService {
  async create(payload, currentUser) {
    const evento = await Evento.findById(payload.eventoId);
    if (!evento) throw new ApiError(404, 'Evento não encontrado.');

    const inscricao = await Inscricao.findOne({ usuarioId: currentUser._id, eventoId: payload.eventoId });
    if (!inscricao) throw new ApiError(403, 'Somente inscritos podem avaliar o evento.');

    const existing = await Feedback.findOne({ usuarioId: currentUser._id, eventoId: payload.eventoId });
    if (existing) throw new ApiError(409, 'Você já enviou feedback para este evento.');

    return Feedback.create({
      usuarioId: currentUser._id,
      eventoId: payload.eventoId,
      nota: payload.nota,
      comentario: payload.comentario || null
    });
  }

  async getByEvent(eventoId, currentUser) {
    const evento = await Evento.findById(eventoId);
    if (!evento) throw new ApiError(404, 'Evento não encontrado.');

    const isOwner = String(evento.organizadorId) === String(currentUser._id);
    if (currentUser.tipoPerfil === 'participante' && !isOwner) {
      throw new ApiError(403, 'Participantes não podem consultar feedbacks de todos os usuários.');
    }

    return Feedback.find({ eventoId })
      .populate('usuarioId', 'nome email curso')
      .sort({ createdAt: -1 });
  }
}

module.exports = new FeedbackService();
