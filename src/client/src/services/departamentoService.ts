import { api } from './api'
import { Universidade } from './universidadeService'

export interface Departamento {
  _id: string
  universidadeId: string | Pick<Universidade, '_id' | 'nome' | 'sigla'>
  nome: string
  sigla?: string | null
  descricao?: string | null
  ativo?: boolean
}

export interface DepartamentoPayload {
  universidadeId: string
  nome: string
  sigla?: string | null
  descricao?: string | null
  ativo?: boolean
}

export const departamentoService = {
  listar(universidadeId?: string) {
    return api.get<Departamento[]>('/departamentos', { auth: false, params: universidadeId ? { universidadeId } : undefined })
  },
  buscarPorId(id: string) {
    return api.get<Departamento>(`/departamentos/${id}`, { auth: false })
  },
  criar(payload: DepartamentoPayload) {
    return api.post<Departamento>('/departamentos', payload)
  },
  atualizar(id: string, payload: DepartamentoPayload) {
    return api.put<Departamento>(`/departamentos/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/departamentos/${id}`)
  }
}
