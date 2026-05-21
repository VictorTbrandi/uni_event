export const formatarData = (data?: string | Date | null) => {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export const formatarDataCurta = (data?: string | Date | null) => {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR')
}

export const formatarDataHora = (data?: string | Date | null) => {
  if (!data) return ''
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const toDateInputValue = (data?: string | Date | null) => {
  if (!data) return ''
  const parsed = new Date(data)
  const offset = parsed.getTimezoneOffset()
  const localDate = new Date(parsed.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 10)
}

export const toDateTimeInputValue = (data?: string | Date | null) => {
  if (!data) return ''
  const parsed = new Date(data)
  const offset = parsed.getTimezoneOffset()
  const localDate = new Date(parsed.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

export const formatarPerfil = (perfil?: string) => {
  const perfis: Record<string, string> = {
    admin: 'Admin',
    organizador: 'Organizador',
    participante: 'Participante'
  }

  return perfis[perfil || ''] || perfil || ''
}

export const formatarStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    aberto: 'Aberto',
    fechado: 'Fechado',
    encerrado: 'Encerrado',
    cancelado: 'Cancelado',
    ativa: 'Ativa',
    confirmada: 'Confirmada',
    participante: 'Participante',
    cancelada: 'Cancelada',
    emitido: 'Emitido',
    revogado: 'Revogado'
  }

  return statusMap[status || ''] || status || ''
}

export const formatarMotivoFechamento = (motivo?: string | null) => {
  const motivoMap: Record<string, string> = {
    cancelado: 'Evento cancelado',
    evento_encerrado: 'Evento encerrado',
    manual: 'Inscrições fechadas',
    sem_prazo: 'Prazo não configurado',
    prazo_encerrado: 'Prazo encerrado',
    lotado: 'Vagas esgotadas'
  }

  return motivoMap[motivo || ''] || ''
}
