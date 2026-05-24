import { api, Perfil, User } from './api'

export interface UserPayload {
  nome: string
  email: string
  senha?: string
  tipoPerfil: Perfil
  curso?: string | null
  universidadeId?: string | null
  cursoId?: string | null
  ra?: string | null
  ativo?: boolean
}

export const userService = {
  listar() {
    return api.get<User[]>('/users')
  },
  criar(payload: UserPayload) {
    return api.post<User>('/users', payload)
  },
  atualizar(id: string, payload: Partial<UserPayload>) {
    return api.put<User>(`/users/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/users/${id}`)
  }
}
