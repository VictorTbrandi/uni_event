import { api } from './api'
import { Universidade } from './universidadeService'
import { Campus } from './campusService'

export type RecursoSala =
  | 'projetor'
  | 'tela'
  | 'ar_condicionado'
  | 'wifi'
  | 'lousa'
  | 'computadores'
  | 'sistema_som'
  | 'microfone'
  | 'transmissao'
  | 'acessibilidade'

export const recursosPermitidos: Array<{ valor: RecursoSala; rotulo: string }> = [
  { valor: 'projetor', rotulo: 'Projetor' },
  { valor: 'tela', rotulo: 'Tela' },
  { valor: 'ar_condicionado', rotulo: 'Ar-condicionado' },
  { valor: 'wifi', rotulo: 'Wi-Fi' },
  { valor: 'lousa', rotulo: 'Lousa' },
  { valor: 'computadores', rotulo: 'Computadores' },
  { valor: 'sistema_som', rotulo: 'Sistema de som' },
  { valor: 'microfone', rotulo: 'Microfone' },
  { valor: 'transmissao', rotulo: 'Transmissao' },
  { valor: 'acessibilidade', rotulo: 'Acessibilidade' }
]

export interface Sala {
  _id: string
  universidadeId: string | Pick<Universidade, '_id' | 'nome' | 'sigla'>
  campusId?: string | Pick<Campus, '_id' | 'nome' | 'sigla' | 'cidade' | 'uf'> | null
  nome: string
  bloco?: string | null
  capacidade: number
  recursos: RecursoSala[]
  observacoes?: string | null
  ativo?: boolean
}

export interface SalaPayload {
  universidadeId: string
  campusId?: string | null
  nome: string
  bloco?: string | null
  capacidade: number
  recursos: RecursoSala[]
  observacoes?: string | null
  ativo?: boolean
}

interface ListarSalasFiltros {
  universidadeId?: string
  campusId?: string
}

export const salaService = {
  listar(filtros: ListarSalasFiltros = {}) {
    const params: Record<string, string> = {}
    if (filtros.universidadeId) params.universidadeId = filtros.universidadeId
    if (filtros.campusId) params.campusId = filtros.campusId

    return api.get<Sala[]>('/salas', {
      auth: false,
      params: Object.keys(params).length ? params : undefined
    })
  },
  buscarPorId(id: string) {
    return api.get<Sala>(`/salas/${id}`, { auth: false })
  },
  criar(payload: SalaPayload) {
    return api.post<Sala>('/salas', payload)
  },
  atualizar(id: string, payload: SalaPayload) {
    return api.put<Sala>(`/salas/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/salas/${id}`)
  }
}
