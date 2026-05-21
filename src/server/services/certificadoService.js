const Certificado = require('../models/Certificado');
const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const ApiError = require('../utils/ApiError');
const generateValidationCode = require('../utils/generateValidationCode');

class CertificadoService {
  async emitir({ usuarioId, eventoId, urlArquivo }, currentUser) {
    const evento = await Evento.findById(eventoId);
    if (!evento) throw new ApiError(404, 'Evento não encontrado.');

    const isOwner = String(evento.organizadorId) === String(currentUser._id);
    if (currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Você não pode emitir certificado para este evento.');
    }

    if (!evento.permiteCertificado) {
      throw new ApiError(400, 'Este evento não permite certificado.');
    }

    const inscricao = await Inscricao.findOne({ usuarioId, eventoId });
    if (!inscricao) throw new ApiError(404, 'Inscrição não encontrada para este usuário no evento.');

    if (!(inscricao.presencaConfirmada || inscricao.status === 'participante')) {
      throw new ApiError(400, 'O certificado só pode ser emitido após participação confirmada.');
    }

    const exists = await Certificado.findOne({ usuarioId, eventoId });
    if (exists) throw new ApiError(409, 'Certificado já emitido para este participante.');

    return Certificado.create({
      usuarioId,
      eventoId,
      codigoValidacao: generateValidationCode(),
      cargaHoraria: evento.cargaHoraria,
      urlArquivo: urlArquivo || null
    });
  }

  async getMine(currentUser) {
    return Certificado.find({ usuarioId: currentUser._id })
      .populate('eventoId', 'titulo data cargaHoraria local')
      .sort({ createdAt: -1 });
  }

  async findById(id, currentUser) {
    const certificado = await Certificado.findById(id)
      .populate('usuarioId', 'nome email')
      .populate('eventoId', 'titulo data local');

    if (!certificado) throw new ApiError(404, 'Certificado não encontrado.');

    const isOwner = String(certificado.usuarioId._id) === String(currentUser._id);
    if (currentUser.tipoPerfil === 'participante' && !isOwner) {
      throw new ApiError(403, 'Você só pode visualizar seus próprios certificados.');
    }

    return certificado;
  }
}

module.exports = new CertificadoService();
