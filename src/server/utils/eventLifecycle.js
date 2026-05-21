const parseTime = (time = '') => {
  const [hour, minute] = String(time).split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return { hour, minute };
};

const combineDateAndTime = (date, time) => {
  if (!date || !time) return null;

  const parsedDate = new Date(date);
  const parsedTime = parseTime(time);
  if (Number.isNaN(parsedDate.getTime()) || !parsedTime) return null;

  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
    parsedTime.hour,
    parsedTime.minute,
    0,
    0
  );
};

const getEventStartAt = (evento) => combineDateAndTime(evento.data, evento.horarioInicio);

const getEventEndAt = (evento) => combineDateAndTime(evento.data, evento.horarioFim);

const normalizeBaseStatus = (status) => {
  if (!status) return 'fechado';
  return status;
};

const resolveEventoStatus = (evento, inscritosCount = 0, now = new Date()) => {
  const baseStatus = normalizeBaseStatus(evento.status);

  if (baseStatus === 'cancelado') {
    return { status: 'cancelado', motivoFechamentoInscricao: 'cancelado' };
  }

  const eventEndAt = getEventEndAt(evento);
  if (eventEndAt && now >= eventEndAt) {
    return { status: 'encerrado', motivoFechamentoInscricao: 'evento_encerrado' };
  }

  if (baseStatus !== 'aberto') {
    return { status: 'fechado', motivoFechamentoInscricao: 'manual' };
  }

  if (!evento.inscricoesEncerramEm) {
    return { status: 'fechado', motivoFechamentoInscricao: 'sem_prazo' };
  }

  const deadline = new Date(evento.inscricoesEncerramEm);
  if (Number.isNaN(deadline.getTime()) || now >= deadline) {
    return { status: 'fechado', motivoFechamentoInscricao: 'prazo_encerrado' };
  }

  if (Number(inscritosCount) >= Number(evento.vagas)) {
    return { status: 'fechado', motivoFechamentoInscricao: 'lotado' };
  }

  return { status: 'aberto', motivoFechamentoInscricao: null };
};

const toPublicEvento = (evento, inscritosCount = 0, now = new Date()) => {
  const plainEvento = typeof evento.toObject === 'function' ? evento.toObject() : { ...evento };
  const lifecycle = resolveEventoStatus(plainEvento, inscritosCount, now);
  const vagasDisponiveis = Math.max(Number(plainEvento.vagas || 0) - Number(inscritosCount || 0), 0);

  return {
    ...plainEvento,
    ...lifecycle,
    inscritosCount,
    vagasDisponiveis,
    inicioEm: getEventStartAt(plainEvento),
    fimEm: getEventEndAt(plainEvento)
  };
};

module.exports = {
  combineDateAndTime,
  getEventStartAt,
  getEventEndAt,
  normalizeBaseStatus,
  resolveEventoStatus,
  toPublicEvento
};
