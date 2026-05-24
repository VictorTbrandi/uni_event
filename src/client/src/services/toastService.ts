import { reactive } from 'vue'

export type ToastTipo = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  tipo: ToastTipo
  titulo: string
  mensagem?: string
  duracao: number
  saindo?: boolean
}

interface ToastOptions {
  titulo?: string
  duracao?: number
}

interface ToastState {
  itens: Toast[]
}

const state = reactive<ToastState>({ itens: [] })
let proxId = 1

const DURACAO_PADRAO = 4000
const DURACAO_PADRAO_ERRO = 6000

const titulosPadrao: Record<ToastTipo, string> = {
  success: 'Sucesso',
  error: 'Erro',
  warning: 'Atencao',
  info: 'Informacao'
}

const removerImediato = (id: number) => {
  const indice = state.itens.findIndex((item) => item.id === id)
  if (indice >= 0) state.itens.splice(indice, 1)
}

const agendarRemocao = (id: number, duracao: number) => {
  if (duracao <= 0) return

  setTimeout(() => {
    const toast = state.itens.find((item) => item.id === id)
    if (!toast) return
    toast.saindo = true

    setTimeout(() => removerImediato(id), 180)
  }, duracao)
}

const adicionar = (tipo: ToastTipo, mensagem: string, opcoes: ToastOptions = {}): number => {
  const id = proxId++
  const duracao = typeof opcoes.duracao === 'number'
    ? opcoes.duracao
    : tipo === 'error'
      ? DURACAO_PADRAO_ERRO
      : DURACAO_PADRAO

  state.itens.push({
    id,
    tipo,
    titulo: opcoes.titulo || titulosPadrao[tipo],
    mensagem,
    duracao
  })

  agendarRemocao(id, duracao)
  return id
}

export const toastService = {
  itens: state.itens,
  success(mensagem: string, opcoes?: ToastOptions) {
    return adicionar('success', mensagem, opcoes)
  },
  error(mensagem: string, opcoes?: ToastOptions) {
    return adicionar('error', mensagem, opcoes)
  },
  warning(mensagem: string, opcoes?: ToastOptions) {
    return adicionar('warning', mensagem, opcoes)
  },
  info(mensagem: string, opcoes?: ToastOptions) {
    return adicionar('info', mensagem, opcoes)
  },
  remover(id: number) {
    const toast = state.itens.find((item) => item.id === id)
    if (!toast) return
    toast.saindo = true
    setTimeout(() => removerImediato(id), 180)
  }
}
