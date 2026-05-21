<template>
  <div>
    <div v-if="carregando" class="estado-loading">Carregando certificado...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>

    <div v-else-if="certificado">
      <div class="page-header page-header-acoes">
        <h1>Certificado</h1>
        <button class="btn-secundario btn-header" type="button" @click="$router.back()">Voltar</button>
      </div>

      <article class="certificado-documento">
        <div class="certificado-documento-borda">
          <div class="certificado-documento-topo">
            <router-link to="/" class="navbar-brand certificado-logo">Uni<span>Event</span></router-link>
            <span :class="['status-tag', `status-${certificado.status}`]">{{ formatarStatus(certificado.status) }}</span>
          </div>

          <div class="certificado-documento-corpo">
            <span class="certificado-label">Certificamos que</span>
            <h2>{{ usuario.nome }}</h2>
            <p>
              participou do evento <strong>{{ evento.titulo }}</strong>, realizado em
              {{ formatarData(evento.data) }}, com carga horaria de {{ certificado.cargaHoraria }} horas.
            </p>
          </div>

          <div class="certificado-documento-info">
            <div>
              <span>Local</span>
              <strong>{{ evento.local }}</strong>
            </div>
            <div>
              <span>Horario</span>
              <strong>{{ evento.horarioInicio }} - {{ evento.horarioFim }}</strong>
            </div>
            <div>
              <span>Emissao</span>
              <strong>{{ formatarData(certificado.dataEmissao) }}</strong>
            </div>
            <div>
              <span>Validacao</span>
              <strong>{{ certificado.codigoValidacao }}</strong>
            </div>
          </div>

          <div class="certificado-documento-rodape">
            <p>Use o codigo de validacao para conferir a autenticidade deste certificado.</p>
            <a v-if="certificado.urlArquivo" class="btn-detalhe" :href="certificado.urlArquivo" target="_blank" rel="noreferrer">
              Abrir arquivo
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import { certificadoService } from '@/services/certificadoService'
import { formatarData, formatarStatus } from '@/utils/formatters'

export default {
  name: 'CertificadoDetalheView',
  data() {
    return {
      certificado: null,
      carregando: true,
      erro: null
    }
  },
  computed: {
    evento() {
      return typeof this.certificado?.eventoId === 'object' ? this.certificado.eventoId : {}
    },
    usuario() {
      return typeof this.certificado?.usuarioId === 'object' ? this.certificado.usuarioId : {}
    }
  },
  async created() {
    await this.carregarCertificado()
  },
  methods: {
    formatarData,
    formatarStatus,
    async carregarCertificado() {
      try {
        this.certificado = await certificadoService.buscarPorId(this.$route.params.id)
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar certificado.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
