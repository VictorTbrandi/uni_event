import { api } from './api'

export interface Universidade {
  _id: string
  nome: string
  sigla: string
  cnpj?: string | null
  site?: string | null
  logoUrl?: string | null
  cidade?: string | null
  uf?: string | null
  endereco?: string | null
  descricao?: string | null
  ativo?: boolean
  createdAt?: string
  updatedAt?: string
}

export type UniversidadePayload = Omit<Universidade, '_id' | 'createdAt' | 'updatedAt'>

export const universidadeService = {
  listar() {
    return api.get<Universidade[]>('/universidades', { auth: false })
  },
  buscarPorId(id: string) {
    return api.get<Universidade>(`/universidades/${id}`, { auth: false })
  },
  criar(payload: UniversidadePayload) {
    return api.post<Universidade>('/universidades', payload)
  },
  atualizar(id: string, payload: UniversidadePayload) {
    return api.put<Universidade>(`/universidades/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/universidades/${id}`)
  }
}
