<template>
  <div>
    <div v-if="carregando" class="estado-loading">Carregando evento...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>

    <div v-else-if="evento">
      <div class="page-header">
        <h1>{{ evento.titulo }}</h1>
      </div>

      <div class="detalhe-container">
        <div class="detalhe-banner">UniEvent</div>

        <div class="detalhe-body">
          <div class="linha-entre detalhe-topo">
            <span class="tag">{{ nomeCategoria }}</span>
            <span :class="['status-tag', `status-${evento.status}`]">{{ formatarStatus(evento.status) }}</span>
          </div>

          <section class="detalhe-secao">
            <h2>Sobre o Evento</h2>
            <p class="detalhe-descricao">{{ evento.descricao }}</p>
          </section>

          <div class="detalhe-grid">
            <div class="detalhe-info-bloco">
              <span class="icone">Data</span>
              <div>
                <strong>Data</strong>
                <p>{{ formatarData(evento.data) }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <span class="icone">Hora</span>
              <div>
                <strong>Horário</strong>
                <p>{{ evento.horarioInicio }} - {{ evento.horarioFim }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <span class="icone">Local</span>
              <div>
                <strong>Local</strong>
                <p>{{ evento.local }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <span class="icone">Carga</span>
              <div>
                <strong>Carga Horária</strong>
                <p>{{ evento.cargaHoraria }}h</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <span class="icone">Cert.</span>
              <div>
                <strong>Certificado</strong>
                <p>{{ evento.permiteCertificado ? 'Sim' : 'Não' }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <span class="icone">Org.</span>
              <div>
                <strong>Organizador</strong>
                <p>{{ nomeOrganizador }}</p>
              </div>
            </div>
          </div>

          <section class="detalhe-secao">
            <h2>Palestrantes</h2>
            <div v-if="palestrantes.length" class="lista-tags">
              <span v-for="palestrante in palestrantes" :key="palestrante._id" class="tag tag-neutra">
                {{ palestrante.nome }}
              </span>
            </div>
            <p v-else class="texto-suave">Palestrantes a definir.</p>
          </section>

          <div class="detalhe-rodape">
            <p class="evento-vagas">{{ evento.vagas }} vagas totais</p>
            <div class="detalhe-acoes">
              <button class="btn-inscrever" :disabled="evento.status !== 'aberto' || inscrevendo" @click="inscrever">
                {{ textoBotaoInscricao }}
              </button>
              <button class="btn-voltar" @click="$router.back()">Voltar</button>
            </div>
            <div v-if="mensagem" :class="['detalhe-mensagem', mensagemTipo]">{{ mensagem }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authStorage } from '@/services/api'
import { eventoService } from '@/services/eventoService'
import { inscricaoService } from '@/services/inscricaoService'
import { formatarData, formatarStatus } from '@/utils/formatters'

export default {
  name: 'EventoDetalheView',
  data() {
    return {
      evento: null,
      carregando: true,
      inscrevendo: false,
      erro: null,
      mensagem: null,
      mensagemTipo: ''
    }
  },
  computed: {
    textoBotaoInscricao() {
      if (this.inscrevendo) return 'Inscrevendo...'
      return this.evento?.status === 'aberto' ? 'Inscrever-se' : 'Inscrições indisponíveis'
    },
    nomeCategoria() {
      return typeof this.evento?.categoriaId === 'object' ? this.evento.categoriaId.nome : 'Sem categoria'
    },
    nomeOrganizador() {
      return typeof this.evento?.organizadorId === 'object' ? this.evento.organizadorId.nome : 'Organizador'
    },
    palestrantes() {
      return (this.evento?.palestrantes || []).filter((palestrante) => typeof palestrante === 'object')
    }
  },
  async created() {
    await this.carregarEvento()
  },
  methods: {
    formatarData,
    formatarStatus,
    async carregarEvento() {
      try {
        this.evento = await eventoService.buscarPorId(this.$route.params.id)
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar evento.'
      } finally {
        this.carregando = false
      }
    },
    async inscrever() {
      if (!authStorage.isAuthenticated()) {
        this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } })
        return
      }

      this.inscrevendo = true
      this.mensagem = null

      try {
        await inscricaoService.inscrever(this.evento._id)
        this.mensagem = 'Inscrição realizada com sucesso!'
        this.mensagemTipo = 'sucesso'
      } catch (error) {
        this.mensagem = error.message || 'Erro ao realizar inscrição.'
        this.mensagemTipo = 'erro'
      } finally {
        this.inscrevendo = false
      }
    }
  }
}
</script>
