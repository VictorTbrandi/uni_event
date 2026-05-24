import { api } from './api'
import { Palestrante } from './eventoService'
import { Sala } from './salaService'

export type TipoAtividade =
  | 'palestra'
  | 'workshop'
  | 'mesa_redonda'
  | 'minicurso'
  | 'sessao_posters'
  | 'apresentacao_oral'
  | 'cerimonia'
  | 'intervalo'

export const tiposAtividade: Array<{ valor: TipoAtividade; rotulo: string }> = [
  { valor: 'palestra', rotulo: 'Palestra' },
  { valor: 'workshop', rotulo: 'Workshop' },
  { valor: 'mesa_redonda', rotulo: 'Mesa-redonda' },
  { valor: 'minicurso', rotulo: 'Minicurso' },
  { valor: 'sessao_posters', rotulo: 'Sessao de posters' },
  { valor: 'apresentacao_oral', rotulo: 'Apresentacao oral' },
  { valor: 'cerimonia', rotulo: 'Cerimonia' },
  { valor: 'intervalo', rotulo: 'Intervalo' }
]

export interface Atividade {
  _id: string
  eventoId: string
  titulo: string
  descricao?: string | null
  tipo: TipoAtividade
  inicio: string
  fim: string
  salaId?: string | Pick<Sala, '_id' | 'nome' | 'bloco' | 'capacidade'> | null
  salaTexto?: string | null
  palestrantes: Array<string | Pick<Palestrante, '_id' | 'nome' | 'titulacao' | 'instituicao'>>
  cargaHoraria?: number | null
  capacidadeMax?: number | null
  ordem?: number
  ativo?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AtividadePayload {
  eventoId: string
  titulo: string
  descricao?: string | null
  tipo: TipoAtividade
  inicio: string
  fim: string
  salaId?: string | null
  salaTexto?: string | null
  palestrantes: string[]
  cargaHoraria?: number | null
  capacidadeMax?: number | null
  ordem?: number
}

export const atividadeService = {
  listarPorEvento(eventoId: string) {
    return api.get<Atividade[]>(`/atividades/evento/${eventoId}`, { auth: false })
  },
  buscarPorId(id: string) {
    return api.get<Atividade>(`/atividades/${id}`, { auth: false })
  },
  criar(payload: AtividadePayload) {
    return api.post<Atividade>('/atividades', payload)
  },
  atualizar(id: string, payload: Omit<AtividadePayload, 'eventoId'>) {
    return api.put<Atividade>(`/atividades/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/atividades/${id}`)
  }
}
