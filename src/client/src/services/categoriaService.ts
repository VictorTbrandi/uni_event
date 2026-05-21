import { api } from './api'
import { Categoria } from './eventoService'

export const categoriaService = {
  listar() {
    return api.get<Categoria[]>('/categorias', { auth: false })
  },
  buscarPorId(id: string) {
    return api.get<Categoria>(`/categorias/${id}`, { auth: false })
  },
  criar(payload: Pick<Categoria, 'nome' | 'descricao'>) {
    return api.post<Categoria>('/categorias', payload)
  },
  atualizar(id: string, payload: Pick<Categoria, 'nome' | 'descricao'>) {
    return api.put<Categoria>(`/categorias/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/categorias/${id}`)
  }
}
