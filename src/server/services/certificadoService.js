const Certificado = require('../models/Certificado');
const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const ApiError = require('../utils/ApiError');
const generateValidationCode = require('../utils/generateValidationCode');
const { resolveEventoStatus } = require('../utils/eventLifecycle');

const activeSubscriptionFilter = { status: { $ne: 'cancelada' } };

class CertificadoService {
  async countActiveSubscriptions(eventoId) {
    return Inscricao.countDocuments({ eventoId, ...activeSubscriptionFilter });
  }

  assertCanManageEvento(evento, currentUser) {
    const isOwner = String(evento.organizadorId) === String(currentUser._id);
    if (currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Voce nao pode emitir certificado para este evento.');
    }
  }

  async assertEventoProntoParaCertificado(evento, currentUser) {
    this.assertCanManageEvento(evento, currentUser);

    if (!evento.permiteCertificado) {
      throw new ApiError(400, 'Este evento nao permite certificado.');
    }

    const totalInscritos = await this.countActiveSubscriptions(evento._id);
    const lifecycle = resolveEventoStatus(evento, totalInscritos);
    if (lifecycle.status !== 'encerrado') {
      throw new ApiError(400, 'Certificados so podem ser emitidos apos o horario final do evento.');
    }
  }

  async emitir({ usuarioId, eventoId, urlArquivo }, currentUser) {
    const evento = await Evento.findById(eventoId);
    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');

    await this.assertEventoProntoParaCertificado(evento, currentUser);

    const inscricao = await Inscricao.findOne({ usuarioId, eventoId });
    if (!inscricao || inscricao.status === 'cancelada') {
      throw new ApiError(404, 'Inscricao ativa nao encontrada para este usuario no evento.');
    }

    const exists = await Certificado.findOne({ usuarioId, eventoId });
    if (exists) throw new ApiError(409, 'Certificado ja emitido para este participante.');

    inscricao.status = 'participante';
    inscricao.presencaConfirmada = true;
    await inscricao.save();

    return Certificado.create({
      usuarioId,
      eventoId,
      codigoValidacao: generateValidationCode(),
      cargaHoraria: evento.cargaHoraria,
      urlArquivo: urlArquivo || null
    });
  }

  async emitirPorEvento(eventoId, currentUser) {
    const evento = await Evento.findById(eventoId);
    if (!evento) throw new ApiError(404, 'Evento nao encontrado.');

    await this.assertEventoProntoParaCertificado(evento, currentUser);

    const inscricoes = await Inscricao.find({ eventoId, ...activeSubscriptionFilter });
    let emitidos = 0;
    let existentes = 0;
    const certificados = [];

    for (const inscricao of inscricoes) {
      const exists = await Certificado.findOne({ usuarioId: inscricao.usuarioId, eventoId });
      if (exists) {
        existentes += 1;
        continue;
      }

      inscricao.status = 'participante';
      inscricao.presencaConfirmada = true;
      await inscricao.save();

      const certificado = await Certificado.create({
        usuarioId: inscricao.usuarioId,
        eventoId,
        codigoValidacao: generateValidationCode(),
        cargaHoraria: evento.cargaHoraria,
        urlArquivo: null
      });

      emitidos += 1;
      certificados.push(certificado);
    }

    return {
      totalInscritos: inscricoes.length,
      emitidos,
      existentes,
      certificados
    };
  }

  async getMine(currentUser) {
    return Certificado.find({ usuarioId: currentUser._id })
      .populate('eventoId', 'titulo data horarioInicio horarioFim cargaHoraria local')
      .sort({ createdAt: -1 });
  }

  async findById(id, currentUser) {
    const certificado = await Certificado.findById(id)
      .populate('usuarioId', 'nome email')
      .populate('eventoId', 'titulo data horarioInicio horarioFim local cargaHoraria');

    if (!certificado) throw new ApiError(404, 'Certificado nao encontrado.');

    const isOwner = String(certificado.usuarioId._id) === String(currentUser._id);
    if (currentUser.tipoPerfil === 'participante' && !isOwner) {
      throw new ApiError(403, 'Voce so pode visualizar seus proprios certificados.');
    }

    return certificado;
  }
}

module.exports = new CertificadoService();
