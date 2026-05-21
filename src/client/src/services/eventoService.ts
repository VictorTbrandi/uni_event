import { api, User } from './api'

export interface Categoria {
  _id: string
  nome: string
  descricao?: string | null
  ativo?: boolean
}

export interface Palestrante {
  _id: string
  nome: string
  email: string
  biografia?: string | null
  areaAtuacao?: string | null
  instituicao?: string | null
  fotoUrl?: string | null
  ativo?: boolean
}

export interface Evento {
  _id: string
  titulo: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  local: string
  cargaHoraria: number
  vagas: number
  categoriaId: string | Categoria
  palestrantes: Array<string | Palestrante>
  organizadorId: string | Pick<User, '_id' | 'nome' | 'email'>
  status: 'rascunho' | 'aberto' | 'encerrado' | 'cancelado'
  permiteCertificado: boolean
  imagemUrl?: string | null
  ativo?: boolean
}

export interface EventoPayload {
  titulo: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  local: string
  cargaHoraria: number
  vagas: number
  categoriaId: string
  palestrantes: string[]
  status: string
  permiteCertificado: boolean
}

export const eventoService = {
  listar() {
    return api.get<Evento[]>('/eventos', { auth: false })
  },
  buscarPorId(id: string) {
    return api.get<Evento>(`/eventos/${id}`, { auth: false })
  },
  criar(payload: EventoPayload) {
    return api.post<Evento>('/eventos', payload)
  },
  atualizar(id: string, payload: EventoPayload) {
    return api.put<Evento>(`/eventos/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/eventos/${id}`)
  },
  participantes(id: string) {
    return api.get<Array<{
      _id: string
      usuarioId: Pick<User, '_id' | 'nome' | 'email' | 'curso' | 'ra'>
      status: string
      presencaConfirmada: boolean
      dataInscricao: string
    }>>(`/eventos/${id}/participantes`)
  },
  feedbacks(id: string) {
    return api.get<Array<{
      _id: string
      usuarioId: Pick<User, '_id' | 'nome' | 'email' | 'curso'>
      nota: number
      comentario?: string | null
      createdAt: string
    }>>(`/eventos/${id}/feedbacks`)
  }
}
