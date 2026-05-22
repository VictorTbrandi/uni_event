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
            <span :class="['status-tag', `status-${evento.status}`]">{{ statusEvento }}</span>
          </div>

          <section class="detalhe-secao">
            <h2>Sobre o Evento</h2>
            <p class="detalhe-descricao">{{ evento.descricao }}</p>
          </section>

          <div class="detalhe-grid">
            <div class="detalhe-info-bloco">
              <div>
                <strong>Data</strong>
                <p>{{ formatarData(evento.data) }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <div>
                <strong>Horario</strong>
                <p>{{ evento.horarioInicio }} - {{ evento.horarioFim }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <div>
                <strong>Local</strong>
                <p>{{ evento.local }}</p>
              </div>
            </div>
            <div v-if="cidadeEvento" class="detalhe-info-bloco">
              <div>
                <strong>Cidade</strong>
                <p>{{ cidadeEvento }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <div>
                <strong>Carga horaria</strong>
                <p>{{ evento.cargaHoraria }}h</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <div>
                <strong>Certificado</strong>
                <p>{{ evento.permiteCertificado ? 'Sim' : 'Nao' }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <div>
                <strong>Organizador</strong>
                <p>{{ nomeOrganizador }}</p>
              </div>
            </div>
            <div class="detalhe-info-bloco">
              <div>
                <strong>Inscricoes ate</strong>
                <p>{{ evento.inscricoesEncerramEm ? formatarDataHora(evento.inscricoesEncerramEm) : 'Fechadas' }}</p>
              </div>
            </div>
          </div>

          <section v-if="evento.previsaoTempoAtiva" class="detalhe-secao">
            <h2>Previsao do tempo</h2>
            <div v-if="carregandoPrevisao" class="texto-suave">Consultando previsao do tempo...</div>
            <div v-else-if="previsaoChuva" class="previsao-detalhe">
              <div class="linha-entre">
                <span :class="['previsao-badge', riscoPrevisaoClasse(previsaoChuva)]">
                  {{ labelRisco(previsaoChuva.nivelRisco) }}
                </span>
                <span class="texto-suave">{{ previsaoChuva.cidade }}{{ previsaoChuva.uf ? `/${previsaoChuva.uf}` : '' }}</span>
              </div>
              <p class="previsao-mensagem">{{ previsaoChuva.mensagem }}</p>
              <div v-if="previsaoChuva.previsaoDisponivel" class="previsao-grid">
                <div>
                  <strong>Condicao</strong>
                  <span>{{ previsaoChuva.condicaoTempo || '-' }}</span>
                </div>
                <div>
                  <strong>Temperatura no horario</strong>
                  <span>{{ formatTemp(previsaoChuva.temperaturaHorario) }}</span>
                </div>
                <div>
                  <strong>Sensacao termica</strong>
                  <span>{{ formatTemp(previsaoChuva.sensacaoTermicaHorario) }}</span>
                </div>
                <div>
                  <strong>Vento no horario</strong>
                  <span>{{ formatWind(previsaoChuva.ventoHorarioKmH) }}</span>
                </div>
                <div>
                  <strong>Minima / maxima</strong>
                  <span>{{ formatTempRange(previsaoChuva.temperaturaMinDia, previsaoChuva.temperaturaMaxDia) }}</span>
                </div>
                <div>
                  <strong>Probabilidade no horario</strong>
                  <span>{{ formatPercent(previsaoChuva.probabilidadeChuvaHorario) }}</span>
                </div>
                <div>
                  <strong>Probabilidade no dia</strong>
                  <span>{{ formatPercent(previsaoChuva.probabilidadeChuvaDia) }}</span>
                </div>
                <div>
                  <strong>Chuva no horario</strong>
                  <span>{{ formatMm(previsaoChuva.chuvaHorarioMm) }}</span>
                </div>
                <div>
                  <strong>Chuva no dia</strong>
                  <span>{{ formatMm(previsaoChuva.chuvaDiaMm) }}</span>
                </div>
                <div>
                  <strong>Horas com chuva</strong>
                  <span>{{ previsaoChuva.horasComChuvaDia }}h</span>
                </div>
                <div>
                  <strong>Vento maximo no dia</strong>
                  <span>{{ formatWind(previsaoChuva.ventoMaxDiaKmH) }}</span>
                </div>
              </div>
            </div>
          </section>

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
            <p :class="['evento-vagas', { esgotado: vagasDisponiveis === 0 }]">
              {{ vagasDisponiveis }} de {{ evento.vagas }} vagas disponiveis
            </p>
            <div class="detalhe-acoes">
              <button class="btn-inscrever" :disabled="!inscricaoDisponivel || inscrevendo" @click="inscrever">
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
import {
  formatarData,
  formatarDataHora,
  formatarMotivoFechamento,
  formatarStatus
} from '@/utils/formatters'

export default {
  name: 'EventoDetalheView',
  data() {
    return {
      evento: null,
      previsaoChuva: null,
      carregandoPrevisao: false,
      carregando: true,
      inscrevendo: false,
      erro: null,
      mensagem: null,
      mensagemTipo: ''
    }
  },
  computed: {
    vagasDisponiveis() {
      return Number.isFinite(Number(this.evento?.vagasDisponiveis))
        ? Number(this.evento.vagasDisponiveis)
        : Number(this.evento?.vagas || 0)
    },
    inscricaoDisponivel() {
      return this.evento?.status === 'aberto' && this.vagasDisponiveis > 0
    },
    textoBotaoInscricao() {
      if (this.inscrevendo) return 'Inscrevendo...'
      return this.inscricaoDisponivel ? 'Inscrever-se' : 'Inscricoes indisponiveis'
    },
    statusEvento() {
      if (this.evento?.status === 'fechado' && this.evento?.motivoFechamentoInscricao) {
        return formatarMotivoFechamento(this.evento.motivoFechamentoInscricao)
      }
      return formatarStatus(this.evento?.status)
    },
    nomeCategoria() {
      return typeof this.evento?.categoriaId === 'object' ? this.evento.categoriaId.nome : 'Sem categoria'
    },
    nomeOrganizador() {
      return typeof this.evento?.organizadorId === 'object' ? this.evento.organizadorId.nome : 'Organizador'
    },
    cidadeEvento() {
      return [this.evento?.cidade, this.evento?.uf].filter(Boolean).join('/')
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
    formatarDataHora,
    formatarStatus,
    async carregarEvento() {
      try {
        this.evento = await eventoService.buscarPorId(this.$route.params.id)
        await this.carregarPrevisaoChuva()
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar evento.'
      } finally {
        this.carregando = false
      }
    },
    async carregarPrevisaoChuva() {
      this.previsaoChuva = null
      if (!this.evento?.previsaoTempoAtiva) return

      this.carregandoPrevisao = true
      try {
        this.previsaoChuva = await eventoService.previsaoChuva(this.evento._id)
      } catch (error) {
        this.previsaoChuva = {
          previsaoDisponivel: false,
          nivelRisco: 'INDISPONIVEL',
          mensagem: error.message || 'Nao foi possivel consultar a previsao do tempo no momento.'
        }
      } finally {
        this.carregandoPrevisao = false
      }
    },
    riscoPrevisaoClasse(previsao) {
      const risco = previsao?.nivelRisco || 'INDISPONIVEL'
      return `previsao-${risco.toLowerCase()}`
    },
    labelRisco(risco) {
      const labels = {
        BAIXO_RISCO: 'Baixo risco',
        RISCO_MODERADO: 'Risco moderado',
        ALTO_RISCO: 'Alto risco',
        INDISPONIVEL: 'Indisponivel'
      }
      return labels[risco] || 'Indisponivel'
    },
    formatPercent(value) {
      return Number.isFinite(Number(value)) ? `${Number(value)}%` : '-'
    },
    formatMm(value) {
      return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} mm` : '-'
    },
    formatTemp(value) {
      return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} C` : '-'
    },
    formatTempRange(min, max) {
      const minText = this.formatTemp(min)
      const maxText = this.formatTemp(max)
      if (minText === '-' && maxText === '-') return '-'
      return `${minText} / ${maxText}`
    },
    formatWind(value) {
      return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} km/h` : '-'
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
        this.mensagem = 'Inscricao realizada com sucesso!'
        this.mensagemTipo = 'sucesso'
        await this.carregarEvento()
      } catch (error) {
        this.mensagem = error.message || 'Erro ao realizar inscricao.'
        this.mensagemTipo = 'erro'
      } finally {
        this.inscrevendo = false
      }
    }
  }
}
</script>
