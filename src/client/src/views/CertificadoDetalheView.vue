<template>
  <div>
    <div v-if="carregando" class="estado-loading">Carregando certificado...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>

    <div v-else-if="certificado">
      <div class="page-header">
        <h1>Certificado</h1>
      </div>

      <div class="detalhe-container">
        <div class="detalhe-body">
          <div class="linha-entre">
            <div>
              <h2>{{ evento.titulo }}</h2>
              <p class="texto-suave">{{ formatarData(evento.data) }} · {{ evento.local }}</p>
            </div>
            <span :class="['status-tag', `status-${certificado.status}`]">{{ formatarStatus(certificado.status) }}</span>
          </div>

          <div class="detalhe-grid detalhe-grid-topo">
            <div class="detalhe-info-bloco">
              <span class="icone">Aluno</span>
              <div>
                <strong>Participante</strong>
                <p>{{ usuario.nome }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <span class="icone">Carga</span>
              <div>
                <strong>Carga Horária</strong>
                <p>{{ certificado.cargaHoraria }}h</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <span class="icone">Código</span>
              <div>
                <strong>Validação</strong>
                <p>{{ certificado.codigoValidacao }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <span class="icone">Emissão</span>
              <div>
                <strong>Data de Emissão</strong>
                <p>{{ formatarData(certificado.dataEmissao) }}</p>
              </div>
            </div>
          </div>

          <div class="detalhe-acoes">
            <a v-if="certificado.urlArquivo" class="btn-detalhe" :href="certificado.urlArquivo" target="_blank" rel="noreferrer">
              Abrir arquivo
            </a>
            <button class="btn-voltar" @click="$router.back()">Voltar</button>
          </div>
        </div>
      </div>
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
