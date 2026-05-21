import { api } from './api'
import { Evento } from './eventoService'

export interface Inscricao {
  _id: string
  eventoId: string | Evento
  status: 'ativa' | 'cancelada' | 'confirmada' | 'participante'
  presencaConfirmada: boolean
  dataInscricao: string
  createdAt?: string
}

export const inscricaoService = {
  minhas() {
    return api.get<Inscricao[]>('/inscricoes/minhas')
  },
  inscrever(eventoId: string) {
    return api.post<Inscricao>('/inscricoes', { eventoId })
  },
  cancelar(id: string) {
    return api.patch<Inscricao>(`/inscricoes/${id}/cancelar`)
  }
}
