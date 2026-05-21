<template>
  <div>
    <div class="page-header">
      <h1>Meus Certificados</h1>
    </div>

    <div v-if="carregando" class="estado-loading">Carregando certificados...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
    <div v-else-if="certificados.length === 0" class="estado-vazio certificado-vazio">
      <h2>Nenhum certificado emitido ainda</h2>
      <p>Quando um evento encerrado emitir certificados, eles aparecerao aqui para consulta.</p>
    </div>

    <div v-else class="certificados-grid">
      <article v-for="certificado in certificados" :key="certificado._id" class="certificado-card">
        <div class="certificado-card-topo">
          <span :class="['status-tag', `status-${certificado.status}`]">{{ formatarStatus(certificado.status) }}</span>
          <span class="certificado-carga">{{ certificado.cargaHoraria }}h</span>
        </div>

        <div class="certificado-card-corpo">
          <span class="certificado-label">Certificado UniEvent</span>
          <h2>{{ evento(certificado).titulo }}</h2>
          <p>{{ formatarData(evento(certificado).data) }} - {{ evento(certificado).local }}</p>
        </div>

        <div class="certificado-card-rodape">
          <div>
            <span>Codigo de validacao</span>
            <strong>{{ certificado.codigoValidacao }}</strong>
          </div>
          <router-link :to="`/meus-certificados/${certificado._id}`" class="btn-detalhe">
            Ver certificado
          </router-link>
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
