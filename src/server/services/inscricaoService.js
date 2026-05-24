const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const ApiError = require('../utils/ApiError');
const { resolveEventoStatus, toPublicEvento } = require('../utils/eventLifecycle');

const activeSubscriptionFilter = { status: { $ne: 'cancelada' } };

const statusMessage = (motivo) => {
  const messages = {
    cancelado: 'Este evento foi cancelado.',
    evento_encerrado: 'Este evento ja foi encerrado.',
    manual: 'As inscricoes deste evento estao fechadas.',
    sem_prazo: 'Este evento precisa de um prazo de encerramento para abrir inscricoes.',
    prazo_encerrado: 'O prazo de inscricao deste evento ja encerrou.',
    lotado: 'Nao ha vagas disponiveis para este evento.'
  };

  return messages[motivo] || 'Este evento nao esta aberto para inscricoes.';
};

class InscricaoService {
  async countActiveSubscriptions(eventoId) {
    return Inscricao.countDocuments({ eventoId, ...activeSubscriptionFilter });
  }

  async toPublicInscricao(inscricao) {
    const plainInscricao = typeof inscricao.toObject === 'function' ? inscricao.toObject() : { ...inscricao };

    if (plainInscricao.eventoId?._id) {
      const totalInscritos = await this.countActiveSubscriptions(plainInscricao.eventoId._id);
      plainInscricao.eventoId = toPublicEvento(plainInscricao.eventoId, totalInscritos);
    }

    return plainInscricao;
  }

  async create(eventoId, currentUser) {
    const evento = await Evento.findById(eventoId);
    if (!evento || !evento.ativo) throw new ApiError(404, 'Evento nao encontrado ou inativo.');

    const existing = await Inscricao.findOne({ usuarioId: currentUser._id, eventoId });
    if (existing && existing.status !== 'cancelada') {
      throw new ApiError(409, 'Voce ja possui inscricao para este evento.');
    }

    const totalInscritos = await this.countActiveSubscriptions(eventoId);
    const lifecycle = resolveEventoStatus(evento, totalInscritos);

    if (lifecycle.status !== 'aberto') {
      throw new ApiError(400, statusMessage(lifecycle.motivoFechamentoInscricao));
    }

    if (existing) {
      existing.status = 'ativa';
      existing.presencaConfirmada = false;
      existing.dataInscricao = new Date();
      await existing.save();
      await existing.populate('eventoId', 'titulo data horarioInicio horarioFim local status vagas inscricoesEncerramEm permiteCertificado');
      return this.toPublicInscricao(existing);
    }

    const inscricao = await Inscricao.create({ usuarioId: currentUser._id, eventoId });
    await inscricao.populate('eventoId', 'titulo data horarioInicio horarioFim local status vagas inscricoesEncerramEm permiteCertificado');
    return this.toPublicInscricao(inscricao);
  }

  async cancel(inscricaoId, currentUser) {
    const inscricao = await Inscricao.findById(inscricaoId).populate('eventoId', 'data horarioInicio horarioFim status vagas inscricoesEncerramEm');
    if (!inscricao) throw new ApiError(404, 'Inscricao nao encontrada.');

    const isOwner = String(inscricao.usuarioId) === String(currentUser._id);
    if (currentUser.tipoPerfil !== 'admin' && !isOwner) {
      throw new ApiError(403, 'Voce nao pode cancelar esta inscricao.');
    }

    if (!inscricao.eventoId) {
      throw new ApiError(404, 'Evento da inscricao nao encontrado.');
    }

    const totalInscritosAntesCancelamento = await this.countActiveSubscriptions(inscricao.eventoId._id);
    const lifecycle = resolveEventoStatus(inscricao.eventoId, totalInscritosAntesCancelamento);
    if (lifecycle.status === 'encerrado') {
      throw new ApiError(400, 'Nao e possivel cancelar inscricao de evento ja realizado.');
    }

    inscricao.status = 'cancelada';
    await inscricao.save();
    return this.toPublicInscricao(inscricao);
  }

  async getMine(currentUser) {
    const inscricoes = await Inscricao.find({ usuarioId: currentUser._id })
      .populate('eventoId', 'titulo data horarioInicio horarioFim local status vagas inscricoesEncerramEm permiteCertificado')
      .sort({ createdAt: -1 });

    return Promise.all(inscricoes.map((inscricao) => this.toPublicInscricao(inscricao)));
  }
}

module.exports = new InscricaoService();
