import { api } from './api'
import { Universidade } from './universidadeService'

export interface Campus {
  _id: string
  universidadeId: string | Pick<Universidade, '_id' | 'nome' | 'sigla'>
  nome: string
  sigla?: string | null
  endereco?: string | null
  cidade?: string | null
  uf?: string | null
  latitude?: number | null
  longitude?: number | null
  ativo?: boolean
}

export interface CampusPayload {
  universidadeId: string
  nome: string
  sigla?: string | null
  endereco?: string | null
  cidade?: string | null
  uf?: string | null
  latitude?: number | null
  longitude?: number | null
  ativo?: boolean
}

export const campusService = {
  listar(universidadeId?: string) {
    return api.get<Campus[]>('/campi', { auth: false, params: universidadeId ? { universidadeId } : undefined })
  },
  buscarPorId(id: string) {
    return api.get<Campus>(`/campi/${id}`, { auth: false })
  },
  criar(payload: CampusPayload) {
    return api.post<Campus>('/campi', payload)
  },
  atualizar(id: string, payload: CampusPayload) {
    return api.put<Campus>(`/campi/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/campi/${id}`)
  }
}
