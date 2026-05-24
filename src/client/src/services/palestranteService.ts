import { api } from './api'
import { Palestrante } from './eventoService'

export type TitulacaoPalestrante = 'graduado' | 'especialista' | 'mestre' | 'doutor' | 'pos_doutor'

export const titulacoesPermitidas: Array<{ valor: TitulacaoPalestrante; rotulo: string }> = [
  { valor: 'graduado', rotulo: 'Graduado(a)' },
  { valor: 'especialista', rotulo: 'Especialista' },
  { valor: 'mestre', rotulo: 'Mestre' },
  { valor: 'doutor', rotulo: 'Doutor(a)' },
  { valor: 'pos_doutor', rotulo: 'Pos-doutor(a)' }
]

export interface PalestrantePayload {
  nome: string
  email: string
  biografia?: string | null
  areaAtuacao?: string | null
  instituicao?: string | null
  fotoUrl?: string | null
  universidadeId?: string | null
  titulacao?: TitulacaoPalestrante | null
  lattes?: string | null
  linkedin?: string | null
}

export const palestranteService = {
  listar() {
    return api.get<Palestrante[]>('/palestrantes', { auth: false })
  },
  buscarPorId(id: string) {
    return api.get<Palestrante>(`/palestrantes/${id}`, { auth: false })
  },
  criar(payload: PalestrantePayload) {
    return api.post<Palestrante>('/palestrantes', payload)
  },
  atualizar(id: string, payload: PalestrantePayload) {
    return api.put<Palestrante>(`/palestrantes/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/palestrantes/${id}`)
  }
}
