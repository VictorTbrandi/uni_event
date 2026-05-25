<template>
  <article class="evento-card evento-card-novo">
    <div class="evento-card-image">
      <img v-if="imagemResolvida" :src="imagemResolvida" :alt="evento.titulo" />
      <span v-else class="evento-card-image-placeholder">{{ iniciais }}</span>

      <span v-if="evento.previsaoTempoAtiva || ehOnline" class="evento-card-badge">
        {{ ehOnline ? 'Evento online' : 'Com previsão do tempo' }}
      </span>
    </div>

    <div class="evento-card-body">
      <div class="evento-card-tags">
        <span class="tag">{{ nomeCategoria }}</span>
        <span :class="['status-tag', `status-${evento.status}`]">{{ rotuloStatus }}</span>
      </div>

      <h3 class="evento-card-titulo">{{ evento.titulo }}</h3>

      <div v-if="dataFormatada" class="evento-card-linha">
        <IconCalendar :size="16" stroke-width="1.8" class="evento-card-icon" aria-hidden="true" />
        <span>{{ dataFormatada }}</span>
      </div>

      <div v-if="localResumo" class="evento-card-linha">
        <IconMapPin :size="16" stroke-width="1.8" class="evento-card-icon" aria-hidden="true" />
        <span>{{ localResumo }}</span>
      </div>

      <div v-if="podeMostrarVagas" :class="['evento-card-vagas', { esgotado: vagasDisponiveis === 0 }]">
        {{ vagasDisponiveis }} de {{ evento.vagas }} vagas
      </div>

      <div class="evento-card-acoes">
        <router-link
          v-if="mostrarDetalhe"
          :to="`/eventos/${evento._id}`"
          class="btn-detalhe evento-card-detalhe"
        >
          Ver detalhes
        </router-link>
        <slot name="acoes" :evento="evento"></slot>
      </div>
    </div>
  </article>
</template>

<script>
import { IconCalendar, IconMapPin } from '@tabler/icons-vue'
import { uploadService } from '@/services/uploadService'
import { formatarData, formatarMotivoFechamento, formatarStatus } from '@/utils/formatters'

export default {
  name: 'EventoCard',
  components: { IconCalendar, IconMapPin },
  props: {
    evento: {
      type: Object,
      required: true
    },
    mostrarDetalhe: {
      type: Boolean,
      default: true
    },
    mostrarVagas: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    imagemResolvida() {
      return uploadService.resolveUrl(this.evento.imagemUrl)
    },
    iniciais() {
      const titulo = this.evento.titulo || 'Evento'
      return titulo
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join('') || 'EV'
    },
    nomeCategoria() {
      const cat = this.evento.categoriaId
      if (cat && typeof cat === 'object') return cat.nome || 'Sem categoria'
      return 'Sem categoria'
    },
    rotuloStatus() {
      if (this.evento.status === 'fechado' && this.evento.motivoFechamentoInscricao) {
        return formatarMotivoFechamento(this.evento.motivoFechamentoInscricao)
      }
      return formatarStatus(this.evento.status)
    },
    dataFormatada() {
      if (!this.evento.data) return ''
      const data = formatarData(this.evento.data)
      if (this.evento.horarioInicio) return `${data} • ${this.evento.horarioInicio}`
      return data
    },
    localResumo() {
      const cidade = [this.evento.cidade, this.evento.uf].filter(Boolean).join('/')
      if (cidade && this.evento.local) return `${this.evento.local} — ${cidade}`
      return this.evento.local || cidade || ''
    },
    ehOnline() {
      const texto = `${this.evento.local || ''} ${this.evento.descricao || ''}`.toLowerCase()
      return /online|remoto|virtual/.test(texto)
    },
    podeMostrarVagas() {
      return this.mostrarVagas && Number.isFinite(Number(this.evento.vagas))
    },
    vagasDisponiveis() {
      const val = Number(this.evento.vagasDisponiveis)
      if (Number.isFinite(val)) return val
      return Number(this.evento.vagas) || 0
    }
  }
}
</script>
