<template>
  <div>
    <div class="page-header">
      <h1>Meus Certificados</h1>
    </div>

    <div v-if="carregando" class="estado-loading">Carregando certificados...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
    <div v-else-if="certificados.length === 0" class="estado-vazio">
      Nenhum certificado emitido até o momento.
    </div>

    <div v-else class="lista-vertical">
      <article v-for="certificado in certificados" :key="certificado._id" class="painel-card">
        <div class="linha-entre">
          <div>
            <h3>{{ evento(certificado).titulo }}</h3>
            <p>{{ formatarData(evento(certificado).data) }} · {{ evento(certificado).local }}</p>
            <p>{{ certificado.cargaHoraria }}h · Código {{ certificado.codigoValidacao }}</p>
          </div>
          <span :class="['status-tag', `status-${certificado.status}`]">{{ formatarStatus(certificado.status) }}</span>
        </div>
        <div class="card-acoes card-acoes-linha">
          <router-link :to="`/meus-certificados/${certificado._id}`" class="btn-detalhe">Ver certificado</router-link>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import { certificadoService } from '@/services/certificadoService'
import { formatarData, formatarStatus } from '@/utils/formatters'

export default {
  name: 'MeusCertificadosView',
  data() {
    return {
      certificados: [],
      carregando: true,
      erro: null
    }
  },
  async created() {
    await this.carregarCertificados()
  },
  methods: {
    formatarData,
    formatarStatus,
    async carregarCertificados() {
      try {
        this.certificados = await certificadoService.meus()
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar certificados.'
      } finally {
        this.carregando = false
      }
    },
    evento(certificado) {
      return typeof certificado.eventoId === 'object' ? certificado.eventoId : {}
    }
  }
}
</script>
