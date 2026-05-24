import { reactive, readonly } from 'vue'

export type Tema = 'light' | 'dark'

const STORAGE_KEY = 'unievent-theme'

const detectarPreferencia = (): Tema => {
  if (typeof window === 'undefined') return 'light'
  try {
    const salvo = localStorage.getItem(STORAGE_KEY) as Tema | null
    if (salvo === 'light' || salvo === 'dark') return salvo
  } catch (_) { /* ignore */ }
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const aplicarNoDom = (tema: Tema) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', tema)
  }
}

const state = reactive<{ tema: Tema }>({ tema: detectarPreferencia() })
aplicarNoDom(state.tema)

const persistir = (tema: Tema) => {
  try {
    localStorage.setItem(STORAGE_KEY, tema)
  } catch (_) { /* ignore */ }
}

export const themeService = {
  estado: readonly(state),
  alternar() {
    state.tema = state.tema === 'dark' ? 'light' : 'dark'
    aplicarNoDom(state.tema)
    persistir(state.tema)
  },
  definir(tema: Tema) {
    state.tema = tema
    aplicarNoDom(tema)
    persistir(tema)
  }
}
