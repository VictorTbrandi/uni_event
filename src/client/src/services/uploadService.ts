import { API_URL, api } from './api'

const apiOrigin = (() => {
  try {
    if (API_URL.startsWith('http')) {
      return new URL(API_URL).origin
    }
    return window.location.origin
  } catch (error) {
    return window.location.origin
  }
})()

export const uploadService = {
  async enviarImagemEvento(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('imagem', file)
    return api.post<{ url: string }>('/uploads/eventos/imagem', formData)
  },
  resolveUrl(url?: string | null): string | null {
    if (!url) return null
    if (/^https?:\/\//i.test(url)) return url
    if (url.startsWith('/')) return `${apiOrigin}${url}`
    return `${apiOrigin}/${url}`
  }
}
