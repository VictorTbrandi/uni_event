import { api } from './api'
import { Palestrante } from './eventoService'

export type PalestrantePayload = Pick<Palestrante, 'nome' | 'email' | 'biografia' | 'areaAtuacao' | 'instituicao' | 'fotoUrl'>

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
