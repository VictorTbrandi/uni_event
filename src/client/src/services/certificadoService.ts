import { api, User } from './api'
import { Evento } from './eventoService'

export interface Certificado {
  _id: string
  usuarioId: string | Pick<User, '_id' | 'nome' | 'email'>
  eventoId: string | Pick<Evento, '_id' | 'titulo' | 'data' | 'horarioInicio' | 'horarioFim' | 'local' | 'cargaHoraria'>
  codigoValidacao: string
  dataEmissao: string
  cargaHoraria: number
  urlArquivo?: string | null
  status: 'emitido' | 'revogado'
}

export interface EmissaoEventoResultado {
  totalInscritos: number
  emitidos: number
  existentes: number
  certificados: Certificado[]
}

export const certificadoService = {
  meus() {
    return api.get<Certificado[]>('/certificados/meus')
  },
  buscarPorId(id: string) {
    return api.get<Certificado>(`/certificados/${id}`)
  },
  emitirPorEvento(eventoId: string) {
    return api.post<EmissaoEventoResultado>(`/certificados/eventos/${eventoId}/emitir`)
  }
}
