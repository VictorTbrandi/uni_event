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

export const toDateInputValue = (data?: string | Date | null) => {
  if (!data) return ''
  const parsed = new Date(data)
  const offset = parsed.getTimezoneOffset()
  const localDate = new Date(parsed.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 10)
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
    rascunho: 'Rascunho',
    aberto: 'Aberto',
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
