export type Perfil = 'admin' | 'organizador' | 'participante'

export interface User {
  _id: string
  nome: string
  email: string
  tipoPerfil: Perfil
  curso?: string | null
  universidadeId?: string | { _id: string; nome: string; sigla: string } | null
  cursoId?: string | { _id: string; nome: string; grau?: string } | null
  ra?: string | null
  ativo?: boolean
}

type QueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryValue | QueryValue[]>

interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
  errors?: unknown
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  auth?: boolean
  body?: unknown
  params?: QueryParams
}

interface ApiValidationError {
  path?: string
  param?: string
  msg?: string
  message?: string
}

export class ApiError extends Error {
  status: number
  data?: unknown
  errors?: unknown

  constructor(message: string, status: number, data?: unknown, errors?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.errors = errors
  }
}

export const API_URL = process.env.VUE_APP_API_URL || '/api'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const LEGACY_USER_KEY = 'usuario'

const buildUrl = (path: string, params?: QueryParams) => {
  const baseUrl = API_URL.startsWith('http') ? API_URL : `${window.location.origin}${API_URL}`
  const url = new URL(`${baseUrl}${path}`)

  Object.entries(params || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined && item !== '') {
          url.searchParams.append(key, String(item))
        }
      })
      return
    }

    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

const parseJson = async <T>(response: Response): Promise<ApiEnvelope<T> | null> => {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as ApiEnvelope<T>
  } catch (error) {
    throw new ApiError('A API retornou uma resposta em formato inválido.', response.status, text)
  }
}

const maybeFixMojibake = (message: string) => {
  if (!/[ÃÂ]/.test(message)) return message

  try {
    const bytes = new Uint8Array(Array.from(message, (char) => char.charCodeAt(0) & 0xff))
    return new TextDecoder('utf-8').decode(bytes)
  } catch (error) {
    return message
  }
}

const fieldLabels: Record<string, string> = {
  nome: 'Nome',
  email: 'E-mail',
  senha: 'Senha',
  novaSenha: 'Nova senha',
  token: 'Token',
  confirmarSenha: 'Confirmar senha',
  tipoPerfil: 'Perfil',
  curso: 'Curso',
  ra: 'RA',
  ativo: 'Status',
  titulo: 'Titulo',
  descricao: 'Descricao',
  data: 'Data',
  horarioInicio: 'Horario de inicio',
  horarioFim: 'Horario de fim',
  local: 'Local',
  cidade: 'Cidade',
  uf: 'UF',
  previsaoTempoAtiva: 'Previsao do tempo',
  cargaHoraria: 'Carga horaria',
  vagas: 'Vagas',
  categoriaId: 'Categoria',
  categoria: 'Categoria',
  palestrantes: 'Palestrantes',
  palestrante: 'Palestrante',
  areaAtuacao: 'Area de atuacao',
  instituicao: 'Instituicao',
  fotoUrl: 'Foto URL',
  biografia: 'Biografia',
  eventoId: 'Evento',
  nota: 'Nota',
  comentario: 'Comentario',
  mensagem: 'Mensagem'
}

const normalizeFieldName = (field?: string) => {
  if (!field) return 'Campo'
  const cleanField = field.replace(/\[\d+\]/g, '').split('.').filter(Boolean).pop() || field
  return fieldLabels[cleanField] || cleanField
}

const isValidationError = (item: unknown): item is ApiValidationError => {
  return Boolean(item && typeof item === 'object' && ('msg' in item || 'message' in item))
}

const formatApiErrorMessage = (message: string, errors: unknown) => {
  if (!Array.isArray(errors) || errors.length === 0) return message

  const details = errors
    .filter(isValidationError)
    .map((error) => {
      const field = normalizeFieldName(error.path || error.param)
      const detail = maybeFixMojibake(String(error.msg || error.message || 'Valor invalido.'))
      return `- ${field}: ${detail}`
    })

  if (!details.length) return message
  return `Corrija os campos abaixo:\n${details.join('\n')}`
}

const request = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { auth = true, body, headers, params, ...fetchOptions } = options
  const requestHeaders = new Headers(headers)

  if (auth) {
    const token = authStorage.getToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  let requestBody: BodyInit | undefined
  if (body !== undefined) {
    if (body instanceof FormData) {
      requestBody = body
    } else {
      requestHeaders.set('Content-Type', 'application/json')
      requestBody = JSON.stringify(body)
    }
  }

  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    headers: requestHeaders,
    body: requestBody
  })

  const json = await parseJson<T>(response)
  const message = maybeFixMojibake(json?.message || 'Erro ao processar a requisição.')

  if (!response.ok || json?.success === false) {
    throw new ApiError(formatApiErrorMessage(message, json?.errors), response.status, json?.data, json?.errors)
  }

  return json?.data as T
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) => request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) => request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) => request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { ...options, method: 'DELETE' })
}

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  getUser(): User | null {
    const rawUser = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY)
    if (!rawUser) return null

    try {
      const user = JSON.parse(rawUser) as User
      if (localStorage.getItem(LEGACY_USER_KEY)) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        localStorage.removeItem(LEGACY_USER_KEY)
      }
      return user
    } catch (error) {
      return null
    }
  },
  setSession(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.removeItem(LEGACY_USER_KEY)
  },
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.removeItem(LEGACY_USER_KEY)
  },
  clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
  },
  isAuthenticated() {
    return Boolean(this.getToken())
  },
  hasPerfil(perfis: Perfil[]) {
    const user = this.getUser()
    return Boolean(user && perfis.includes(user.tipoPerfil))
  }
}
