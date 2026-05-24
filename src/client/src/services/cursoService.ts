import { api, User } from './api'
import { Universidade } from './universidadeService'
import { Departamento } from './departamentoService'

export type GrauCurso = 'graduacao' | 'pos_graduacao' | 'mestrado' | 'doutorado' | 'tecnico' | 'extensao'

export const grausPermitidos: Array<{ valor: GrauCurso; rotulo: string }> = [
  { valor: 'graduacao', rotulo: 'Graduacao' },
  { valor: 'pos_graduacao', rotulo: 'Pos-graduacao' },
  { valor: 'mestrado', rotulo: 'Mestrado' },
  { valor: 'doutorado', rotulo: 'Doutorado' },
  { valor: 'tecnico', rotulo: 'Tecnico' },
  { valor: 'extensao', rotulo: 'Extensao' }
]

export interface Curso {
  _id: string
  universidadeId: string | Pick<Universidade, '_id' | 'nome' | 'sigla'>
  departamentoId?: string | Pick<Departamento, '_id' | 'nome' | 'sigla'> | null
  nome: string
  grau: GrauCurso
  cargaHorariaTotal?: number | null
  duracaoSemestres?: number | null
  coordenadorId?: string | Pick<User, '_id' | 'nome' | 'email'> | null
  descricao?: string | null
  ativo?: boolean
}

export interface CursoPayload {
  universidadeId: string
  departamentoId?: string | null
  nome: string
  grau: GrauCurso
  cargaHorariaTotal?: number | null
  duracaoSemestres?: number | null
  coordenadorId?: string | null
  descricao?: string | null
  ativo?: boolean
}

interface ListarCursosFiltros {
  universidadeId?: string
  departamentoId?: string
}

export const cursoService = {
  listar(filtros: ListarCursosFiltros = {}) {
    const params: Record<string, string> = {}
    if (filtros.universidadeId) params.universidadeId = filtros.universidadeId
    if (filtros.departamentoId) params.departamentoId = filtros.departamentoId

    return api.get<Curso[]>('/cursos', {
      auth: false,
      params: Object.keys(params).length ? params : undefined
    })
  },
  buscarPorId(id: string) {
    return api.get<Curso>(`/cursos/${id}`, { auth: false })
  },
  criar(payload: CursoPayload) {
    return api.post<Curso>('/cursos', payload)
  },
  atualizar(id: string, payload: CursoPayload) {
    return api.put<Curso>(`/cursos/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/cursos/${id}`)
  }
}
