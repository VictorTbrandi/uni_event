import { api, authStorage, User } from './api'

interface AuthPayload {
  user: User
  token: string
}

interface LoginPayload {
  email: string
  senha: string
}

interface RegisterPayload extends LoginPayload {
  nome: string
  curso?: string
  ra?: string
}

export const authService = {
  async login(payload: LoginPayload) {
    const data = await api.post<AuthPayload>('/auth/login', payload, { auth: false })
    authStorage.setSession(data.token, data.user)
    return data
  },
  async register(payload: RegisterPayload) {
    return api.post<AuthPayload>('/auth/register', { ...payload, tipoPerfil: 'participante' }, { auth: false })
  },
  forgotPassword(email: string) {
    return api.post<{ resetToken: string; expiresAt: string; note?: string }>('/auth/forgot-password', { email }, { auth: false })
  },
  resetPassword(token: string, novaSenha: string) {
    return api.post<null>('/auth/reset-password', { token, novaSenha }, { auth: false })
  },
  me() {
    return api.get<User>('/auth/me')
  },
  async updateProfile(id: string, payload: Partial<User>) {
    const user = await api.put<User>(`/users/${id}`, payload)
    authStorage.setUser(user)
    return user
  },
  logout() {
    authStorage.clearSession()
  }
}
