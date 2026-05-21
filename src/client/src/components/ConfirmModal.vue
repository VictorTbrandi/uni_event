<template>
  <div v-if="aberto" class="modal-backdrop" @click.self="$emit('cancelar')">
    <section class="modal-confirmacao" role="dialog" aria-modal="true" :aria-labelledby="tituloId">
      <h2 :id="tituloId">{{ titulo }}</h2>
      <p>{{ mensagem }}</p>

      <div class="modal-acoes">
        <button type="button" class="btn-secundario" @click="$emit('cancelar')">
          {{ textoCancelar }}
        </button>
        <button type="button" class="btn-perigo" @click="$emit('confirmar')">
          {{ textoConfirmar }}
        </button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    aberto: {
      type: Boolean,
      default: false
    },
    titulo: {
      type: String,
      default: 'Confirmar acao'
    },
    mensagem: {
      type: String,
      default: 'Deseja continuar?'
    },
    textoConfirmar: {
      type: String,
      default: 'Confirmar'
    },
    textoCancelar: {
      type: String,
      default: 'Cancelar'
    }
  },
  computed: {
    tituloId() {
      return `modal-confirmacao-${this._uid}`
    }
  }
}
</script>
