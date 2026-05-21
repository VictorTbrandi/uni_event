import { api } from './api'

export interface FeedbackPayload {
  eventoId: string
  nota: number
  comentario?: string
}

export const feedbackService = {
  enviar(payload: FeedbackPayload) {
    return api.post('/feedbacks', payload)
  }
}
