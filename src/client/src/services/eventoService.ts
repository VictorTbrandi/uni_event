import { api, authStorage, User } from './api'
import { Universidade } from './universidadeService'
import { Departamento } from './departamentoService'
import { Campus } from './campusService'

export interface Categoria {
  _id: string
  nome: string
  descricao?: string | null
  ativo?: boolean
}

export interface Palestrante {
  _id: string
  nome: string
  email: string
  biografia?: string | null
  areaAtuacao?: string | null
  instituicao?: string | null
  fotoUrl?: string | null
  universidadeId?: string | Pick<Universidade, '_id' | 'nome' | 'sigla'> | null
  titulacao?: 'graduado' | 'especialista' | 'mestre' | 'doutor' | 'pos_doutor' | null
  lattes?: string | null
  linkedin?: string | null
  ativo?: boolean
}

export interface Evento {
  _id: string
  titulo: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  local: string
  cidade?: string | null
  uf?: string | null
  latitude?: number | null
  longitude?: number | null
  previsaoTempoAtiva?: boolean
  cargaHoraria: number
  vagas: number
  inscricoesEncerramEm?: string | null
  categoriaId: string | Categoria
  universidadeId?: string | Pick<Universidade, '_id' | 'nome' | 'sigla'> | null
  departamentoId?: string | Pick<Departamento, '_id' | 'nome' | 'sigla'> | null
  campusId?: string | Pick<Campus, '_id' | 'nome' | 'sigla' | 'cidade' | 'uf'> | null
  palestrantes: Array<string | Palestrante>
  organizadorId: string | Pick<User, '_id' | 'nome' | 'email'>
  status: 'aberto' | 'fechado' | 'encerrado' | 'cancelado'
  motivoFechamentoInscricao?: string | null
  inscritosCount?: number
  vagasDisponiveis?: number
  inicioEm?: string | null
  fimEm?: string | null
  permiteCertificado: boolean
  imagemUrl?: string | null
  ativo?: boolean
}

export interface EventoPayload {
  titulo: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  local: string
  cidade: string | null
  uf: string | null
  previsaoTempoAtiva: boolean
  cargaHoraria: number
  vagas: number
  inscricoesEncerramEm: string | null
  categoriaId: string
  universidadeId?: string | null
  departamentoId?: string | null
  campusId?: string | null
  palestrantes: string[]
  status: string
  permiteCertificado: boolean
}

export interface PrevisaoChuvaEvento {
  eventoId: string | null
  tituloEvento: string
  dataEvento: string
  horarioInicio: string
  cidade?: string | null
  uf?: string | null
  latitude?: number | null
  longitude?: number | null
  previsaoDisponivel: boolean
  probabilidadeChuvaHorario: number | null
  probabilidadeChuvaDia: number | null
  chuvaHorarioMm: number | null
  chuvaDiaMm: number | null
  horasComChuvaDia: number | null
  temperaturaHorario?: number | null
  sensacaoTermicaHorario?: number | null
  ventoHorarioKmH?: number | null
  temperaturaMinDia?: number | null
  temperaturaMaxDia?: number | null
  ventoMaxDiaKmH?: number | null
  codigoTempoHorario?: number | null
  codigoTempoDia?: number | null
  condicaoTempo?: string | null
  nivelRisco: 'BAIXO_RISCO' | 'RISCO_MODERADO' | 'ALTO_RISCO' | 'INDISPONIVEL'
  mensagem: string
}

export interface PrevisaoChuvaPreviewPayload {
  titulo?: string
  data: string
  horarioInicio: string
  horarioFim?: string
  cidade: string
  uf: string
}

const deveListarComoGestor = () => {
  const user = authStorage.getUser()
  return user?.tipoPerfil === 'admin' || user?.tipoPerfil === 'organizador'
}

export const eventoService = {
  listar() {
    return api.get<Evento[]>('/eventos', { auth: deveListarComoGestor() })
  },
  buscarPorId(id: string) {
    return api.get<Evento>(`/eventos/${id}`, { auth: authStorage.isAuthenticated() })
  },
  previsaoChuva(id: string) {
    return api.get<PrevisaoChuvaEvento>(`/eventos/${id}/previsao-chuva`, { auth: authStorage.isAuthenticated() })
  },
  previsaoChuvaPreview(payload: PrevisaoChuvaPreviewPayload) {
    return api.post<PrevisaoChuvaEvento>('/eventos/previsao-chuva/preview', payload)
  },
  criar(payload: EventoPayload) {
    return api.post<Evento>('/eventos', payload)
  },
  atualizar(id: string, payload: EventoPayload) {
    return api.put<Evento>(`/eventos/${id}`, payload)
  },
  excluir(id: string) {
    return api.delete<null>(`/eventos/${id}`)
  },
  participantes(id: string) {
    return api.get<Array<{
      _id: string
      usuarioId: Pick<User, '_id' | 'nome' | 'email' | 'curso' | 'ra'>
      status: string
      presencaConfirmada: boolean
      dataInscricao: string
    }>>(`/eventos/${id}/participantes`)
  },
  feedbacks(id: string) {
    return api.get<Array<{
      _id: string
      usuarioId: Pick<User, '_id' | 'nome' | 'email' | 'curso'>
      nota: number
      comentario?: string | null
      createdAt: string
    }>>(`/eventos/${id}/feedbacks`)
  }
}
