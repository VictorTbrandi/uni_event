import { api } from './api'

export interface ChatMensagem {
  autor: 'usuario' | 'ia'
  texto: string
}

export interface ChatIAResponse {
  resposta: string
  sugestoes: string[]
}

export const iaService = {
  chat(mensagem: string, historico: ChatMensagem[] = []) {
    return api.post<ChatIAResponse>('/ia/chat', { mensagem, historico })
  },
  resumirFeedbacks(eventoId: string) {
    return api.post<{ quantidade: number; media: number; resumo: string }>('/ia/resumir-feedbacks', { eventoId })
  },
  classificarSatisfacao(eventoId: string) {
    return api.post<{ media: number; classificacao: string }>('/ia/classificar-satisfacao', { eventoId })
  }
}
