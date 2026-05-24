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
            <div v-if="rotuloUniversidade" class="detalhe-info-bloco">
              <div>
                <strong>Universidade</strong>
                <p>{{ rotuloUniversidade }}</p>
              </div>
            </div>
            <div v-if="rotuloDepartamento" class="detalhe-info-bloco">
              <div>
                <strong>Departamento</strong>
                <p>{{ rotuloDepartamento }}</p>
              </div>
            </div>
            <div v-if="rotuloCampus" class="detalhe-info-bloco">
              <div>
                <strong>Campus</strong>
                <p>{{ rotuloCampus }}</p>
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

          <section class="detalhe-secao">
            <div class="linha-entre" style="align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
              <h2 style="margin-bottom: 0;">Programacao</h2>
              <router-link
                v-if="podeGerenciarProgramacao"
                :to="{ name: 'evento-programacao', params: { id: evento._id } }"
                class="btn-mini-link"
              >
                Gerenciar atividades
              </router-link>
            </div>

            <div v-if="carregandoAtividades" class="texto-suave">Carregando atividades...</div>
            <p v-else-if="!atividades.length" class="texto-suave">Programacao detalhada ainda nao divulgada.</p>
            <ul v-else class="timeline-atividades-detalhe">
              <li v-for="a in atividades" :key="a._id" class="timeline-detalhe-item">
                <div class="timeline-detalhe-horario">
                  <strong>{{ horario(a.inicio) }}</strong>
                  <span>{{ horario(a.fim) }}</span>
                </div>
                <div class="timeline-detalhe-conteudo">
                  <div class="linha-entre" style="align-items: center;">
                    <span class="tag">{{ rotuloTipoAtividade(a.tipo) }}</span>
                    <span v-if="a.cargaHoraria" class="texto-suave">{{ a.cargaHoraria }}h</span>
                  </div>
                  <h3>{{ a.titulo }}</h3>
                  <p v-if="a.descricao" class="texto-suave">{{ a.descricao }}</p>
                  <div class="timeline-detalhe-meta">
                    <span v-if="nomeSalaAtividade(a)"><strong>Sala:</strong> {{ nomeSalaAtividade(a) }}</span>
                    <span v-if="nomesPalestrantesAtividade(a)"><strong>Palestrantes:</strong> {{ nomesPalestrantesAtividade(a) }}</span>
                  </div>
                </div>
              </li>
            </ul>
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
import { atividadeService, tiposAtividade } from '@/services/atividadeService'
import {
  formatarData,
  formatarDataHora,
  formatarMotivoFechamento,
  formatarStatus
} from '@/utils/formatters'

const idDe = (ref) => (ref && typeof ref === 'object' ? ref._id : ref)

export default {
  name: 'EventoDetalheView',
  data() {
    return {
      evento: null,
      previsaoChuva: null,
      carregandoPrevisao: false,
      carregando: true,
      atividades: [],
      carregandoAtividades: false,
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
    rotuloUniversidade() {
      const ref = this.evento?.universidadeId
      if (!ref || typeof ref !== 'object') return ''
      return ref.sigla ? `${ref.sigla} - ${ref.nome}` : ref.nome
    },
    rotuloDepartamento() {
      const ref = this.evento?.departamentoId
      if (!ref || typeof ref !== 'object') return ''
      return ref.nome
    },
    rotuloCampus() {
      const ref = this.evento?.campusId
      if (!ref || typeof ref !== 'object') return ''
      const local = [ref.cidade, ref.uf].filter(Boolean).join('/')
      return local ? `${ref.nome} (${local})` : ref.nome
    },
    palestrantes() {
      return (this.evento?.palestrantes || []).filter((palestrante) => typeof palestrante === 'object')
    },
    podeGerenciarProgramacao() {
      const usuario = authStorage.getUser()
      if (!usuario || !this.evento) return false
      if (usuario.tipoPerfil === 'admin') return true
      if (usuario.tipoPerfil !== 'organizador') return false
      return idDe(this.evento.organizadorId) === usuario._id
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
        await Promise.all([this.carregarPrevisaoChuva(), this.carregarAtividades()])
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar evento.'
      } finally {
        this.carregando = false
      }
    },
    async carregarAtividades() {
      if (!this.evento?._id) return
      this.carregandoAtividades = true
      try {
        this.atividades = await atividadeService.listarPorEvento(this.evento._id)
      } catch (error) {
        this.atividades = []
      } finally {
        this.carregandoAtividades = false
      }
    },
    horario(iso) {
      if (!iso) return ''
      return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    },
    rotuloTipoAtividade(valor) {
      return tiposAtividade.find((t) => t.valor === valor)?.rotulo || valor
    },
    nomeSalaAtividade(atividade) {
      const ref = atividade.salaId
      if (ref) {
        if (typeof ref === 'object') return ref.bloco ? `${ref.nome} / ${ref.bloco}` : ref.nome
      }
      return atividade.salaTexto || ''
    },
    nomesPalestrantesAtividade(atividade) {
      return (atividade.palestrantes || [])
        .map((p) => (typeof p === 'object' ? p.nome : null))
        .filter(Boolean)
        .join(', ')
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

<style scoped>
.timeline-atividades-detalhe {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-detalhe-item {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 14px;
  padding: 14px 16px;
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
}

.timeline-detalhe-horario {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-detalhe-horario strong {
  font-family: var(--font-mono);
  font-size: 15px;
  color: var(--color-primary);
  font-weight: 700;
}

.timeline-detalhe-horario span {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-subtle);
}

.timeline-detalhe-conteudo {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-detalhe-conteudo h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin: 4px 0 2px;
}

.timeline-detalhe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 6px;
}

.timeline-detalhe-meta strong {
  font-weight: 600;
  color: var(--color-text);
  margin-right: 4px;
}

@media (max-width: 600px) {
  .timeline-detalhe-item {
    grid-template-columns: 1fr;
  }
  .timeline-detalhe-horario {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
}
</style>
