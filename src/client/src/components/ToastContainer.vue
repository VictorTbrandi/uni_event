<template>
  <Teleport to="body">
    <div class="toast-container" role="region" aria-live="polite" aria-label="Notificacoes">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.tipo}`, { 'toast--saindo': toast.saindo }]"
          role="status"
        >
          <span class="toast-icon" aria-hidden="true">{{ iconePorTipo(toast.tipo) }}</span>
          <div class="toast-body">
            <div class="toast-titulo">{{ toast.titulo }}</div>
            <div v-if="toast.mensagem" class="toast-mensagem">{{ toast.mensagem }}</div>
          </div>
          <button type="button" class="toast-close" aria-label="Fechar notificacao" @click="fechar(toast.id)">
            &times;
          </button>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script>
import { toastService } from '@/services/toastService'

const icones = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i'
}

export default {
  name: 'ToastContainer',
  data() {
    return {
      toasts: toastService.itens
    }
  },
  methods: {
    fechar(id) {
      toastService.remover(id)
    },
    iconePorTipo(tipo) {
      return icones[tipo] || 'i'
    }
  }
}
</script>
