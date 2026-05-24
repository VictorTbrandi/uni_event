<template>
  <div>
    <div v-if="carregando" class="estado-loading">Carregando programacao...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>

    <template v-else-if="evento">
      <div class="page-header page-header-acoes">
        <div class="page-header-titulo">
          <div class="linha-titulo-role">
            <h1>Programacao</h1>
            <span class="role-pill">{{ evento.titulo }}</span>
          </div>
          <p class="page-subtitle">
            {{ formatarData(evento.data) }} &middot; {{ evento.horarioInicio }} - {{ evento.horarioFim }}
          </p>
        </div>
        <button v-if="podeEditar" type="button" class="btn-submit btn-header" @click="abrirCadastro">
          Adicionar atividade
        </button>
      </div>

      <section v-if="formAberto" class="painel-card crud-form-card">
        <h2>{{ editandoId ? 'Editar atividade' : 'Nova atividade' }}</h2>
        <div v-if="erroForm" class="estado-erro form-erro">{{ erroForm }}</div>

        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Titulo</label>
            <input v-model="form.titulo" type="text" required maxlength="180" />
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Tipo</label>
              <select v-model="form.tipo" required>
                <option v-for="t in tiposOpcoes" :key="t.valor" :value="t.valor">{{ t.rotulo }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Carga horaria (h)</label>
              <input v-model.number="form.cargaHoraria" type="number" min="0" step="0.5" />
            </div>
            <div class="form-group">
              <label>Capacidade maxima</label>
              <input v-model.number="form.capacidadeMax" type="number" min="1" />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Inicio</label>
              <input v-model="form.inicio" type="datetime-local" :min="dataHoraMinima" :max="dataHoraMaxima" required />
            </div>
            <div class="form-group">
              <label>Fim</label>
              <input v-model="form.fim" type="datetime-local" :min="dataHoraMinima" :max="dataHoraMaxima" required />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Sala cadastrada</label>
              <select v-model="form.salaId">
                <option value="">Nao informada</option>
                <option v-for="s in salasFiltradas" :key="s._id" :value="s._id">
                  {{ s.nome }}{{ s.bloco ? ' / ' + s.bloco : '' }} ({{ s.capacidade }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Sala (texto livre)</label>
              <input v-model="form.salaTexto" type="text" maxlength="120" placeholder="Use se nao houver sala cadastrada" />
            </div>
          </div>
          <div class="form-group">
            <label>Palestrantes</label>
            <div v-if="palestrantes.length" class="checkbox-lista checkbox-lista-grid">
              <label v-for="p in palestrantes" :key="p._id" class="checkbox-opcao checkbox-opcao-compact">
                <input v-model="form.palestrantes" type="checkbox" :value="p._id" />
                <span><strong>{{ p.nome }}</strong>
                  <small v-if="p.titulacao || p.instituicao">{{ resumoPalestrante(p) }}</small>
                </span>
              </label>
            </div>
            <p v-else class="texto-suave texto-formulario">
              Nenhum palestrante cadastrado.
            </p>
          </div>
          <div class="form-group">
            <label>Descricao</label>
            <textarea v-model="form.descricao" rows="3" maxlength="1500"></textarea>
          </div>

          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvando" class="btn-submit">
              {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
            </button>
            <button type="button" class="btn-secundario" @click="fecharForm">Cancelar</button>
          </div>
        </form>
      </section>

      <div v-if="!atividades.length" class="estado-vazio">
        {{ podeEditar ? 'Adicione atividades para montar a programacao.' : 'Programacao ainda nao divulgada.' }}
      </div>

      <ul v-else class="timeline-atividades">
        <li v-for="a in atividades" :key="a._id" class="timeline-item">
          <div class="timeline-horario">
            <strong>{{ horario(a.inicio) }}</strong>
            <span>{{ horario(a.fim) }}</span>
          </div>
          <div class="timeline-conteudo">
            <div class="linha-entre" style="align-items: center;">
              <span class="tag">{{ rotuloTipo(a.tipo) }}</span>
              <span v-if="a.cargaHoraria" class="texto-suave">{{ a.cargaHoraria }}h</span>
            </div>
            <h3 class="timeline-titulo">{{ a.titulo }}</h3>
            <p v-if="a.descricao" class="timeline-descricao">{{ a.descricao }}</p>
            <div class="timeline-meta">
              <span v-if="nomeSala(a)" class="timeline-meta-item">
                <strong>Sala:</strong> {{ nomeSala(a) }}
              </span>
              <span v-if="capacidadeAtividade(a)" class="timeline-meta-item">
                <strong>Capacidade:</strong> {{ capacidadeAtividade(a) }}
              </span>
              <span v-if="nomesPalestrantes(a)" class="timeline-meta-item">
                <strong>Palestrantes:</strong> {{ nomesPalestrantes(a) }}
              </span>
            </div>
            <div v-if="podeEditar" class="card-acoes">
              <button type="button" class="btn-mini" @click="editar(a)">Editar</button>
              <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(a)">Excluir</button>
            </div>
          </div>
        </li>
      </ul>

      <div style="margin-top: 24px;">
        <button type="button" class="btn-voltar" @click="$router.back()">Voltar</button>
      </div>
    </template>

    <ConfirmModal
      :aberto="Boolean(atividadeParaExcluir)"
      titulo="Excluir atividade"
      :mensagem="mensagemExclusao"
      texto-confirmar="Excluir"
      @cancelar="atividadeParaExcluir = null"
      @confirmar="confirmarExclusao"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/ConfirmModal.vue'
import { authStorage } from '@/services/api'
import { eventoService } from '@/services/eventoService'
import { palestranteService } from '@/services/palestranteService'
import { salaService } from '@/services/salaService'
import { atividadeService, tiposAtividade } from '@/services/atividadeService'
import { toastService } from '@/services/toastService'
import { formatarData, toDateTimeInputValue } from '@/utils/formatters'

const idDe = (ref) => (ref && typeof ref === 'object' ? ref._id : ref)

const formInicial = () => ({
  titulo: '',
  descricao: '',
  tipo: 'palestra',
  inicio: '',
  fim: '',
  salaId: '',
  salaTexto: '',
  palestrantes: [],
  cargaHoraria: null,
  capacidadeMax: null
})

export default {
  name: 'ProgramacaoEventoView',
  components: { ConfirmModal },
  data() {
    return {
      evento: null,
      atividades: [],
      palestrantes: [],
      salas: [],
      form: formInicial(),
      formAberto: false,
      editandoId: null,
      carregando: true,
      salvando: false,
      erro: null,
      erroForm: null,
      atividadeParaExcluir: null
    }
  },
  computed: {
    usuario() {
      return authStorage.getUser()
    },
    podeEditar() {
      if (!this.usuario || !this.evento) return false
      if (this.usuario.tipoPerfil === 'admin') return true
      if (this.usuario.tipoPerfil !== 'organizador') return false
      return idDe(this.evento.organizadorId) === this.usuario._id
    },
    tiposOpcoes() {
      return tiposAtividade
    },
    salasFiltradas() {
      const uniId = idDe(this.evento?.universidadeId)
      if (!uniId) return this.salas
      return this.salas.filter((s) => idDe(s.universidadeId) === uniId)
    },
    dataHoraMinima() {
      if (!this.evento?.data) return ''
      const dia = String(this.evento.data).slice(0, 10)
      return `${dia}T00:00`
    },
    dataHoraMaxima() {
      if (!this.evento?.data) return ''
      const dia = String(this.evento.data).slice(0, 10)
      return `${dia}T23:59`
    },
    mensagemExclusao() {
      const titulo = this.atividadeParaExcluir?.titulo || 'esta atividade'
      return `Tem certeza que deseja excluir "${titulo}"? Essa acao nao pode ser desfeita.`
    }
  },
  async created() {
    await this.carregarTudo()
  },
  methods: {
    formatarData,
    rotuloTipo(valor) {
      return tiposAtividade.find((t) => t.valor === valor)?.rotulo || valor
    },
    horario(iso) {
      if (!iso) return ''
      const data = new Date(iso)
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    },
    nomeSala(atividade) {
      const ref = atividade.salaId
      if (ref) {
        if (typeof ref === 'object') {
          return ref.bloco ? `${ref.nome} / ${ref.bloco}` : ref.nome
        }
        const sala = this.salas.find((s) => s._id === ref)
        if (sala) return sala.bloco ? `${sala.nome} / ${sala.bloco}` : sala.nome
      }
      return atividade.salaTexto || ''
    },
    capacidadeAtividade(atividade) {
      if (atividade.capacidadeMax) return atividade.capacidadeMax
      const ref = atividade.salaId
      if (ref && typeof ref === 'object' && ref.capacidade) return ref.capacidade
      return null
    },
    nomesPalestrantes(atividade) {
      return (atividade.palestrantes || [])
        .map((p) => (typeof p === 'object' ? p.nome : null))
        .filter(Boolean)
        .join(', ')
    },
    resumoPalestrante(p) {
      const parts = []
      if (p.titulacao) parts.push(this.rotuloTitulacao(p.titulacao))
      if (p.instituicao) parts.push(p.instituicao)
      return parts.join(' - ')
    },
    rotuloTitulacao(valor) {
      const mapa = {
        graduado: 'Graduado',
        especialista: 'Especialista',
        mestre: 'Mestre',
        doutor: 'Doutor',
        pos_doutor: 'Pos-doutor'
      }
      return mapa[valor] || valor
    },
    async carregarTudo() {
      this.carregando = true
      this.erro = null
      try {
        const eventoId = this.$route.params.id
        const [evento, atividades, palestrantes, salas] = await Promise.all([
          eventoService.buscarPorId(eventoId),
          atividadeService.listarPorEvento(eventoId),
          palestranteService.listar(),
          salaService.listar()
        ])
        this.evento = evento
        this.atividades = atividades
        this.palestrantes = palestrantes
        this.salas = salas
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar a programacao.'
      } finally {
        this.carregando = false
      }
    },
    abrirCadastro() {
      this.form = formInicial()
      this.editandoId = null
      this.erroForm = null
      this.formAberto = true

      if (this.evento?.data) {
        const dia = String(this.evento.data).slice(0, 10)
        this.form.inicio = `${dia}T09:00`
        this.form.fim = `${dia}T10:00`
      }
    },
    editar(atividade) {
      this.editandoId = atividade._id
      this.form = {
        titulo: atividade.titulo || '',
        descricao: atividade.descricao || '',
        tipo: atividade.tipo || 'palestra',
        inicio: toDateTimeInputValue(atividade.inicio),
        fim: toDateTimeInputValue(atividade.fim),
        salaId: idDe(atividade.salaId) || '',
        salaTexto: atividade.salaTexto || '',
        palestrantes: (atividade.palestrantes || []).map(idDe).filter(Boolean),
        cargaHoraria: atividade.cargaHoraria ?? null,
        capacidadeMax: atividade.capacidadeMax ?? null
      }
      this.formAberto = true
      this.erroForm = null
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    fecharForm() {
      this.formAberto = false
      this.editandoId = null
      this.erroForm = null
    },
    payload() {
      return {
        eventoId: this.evento._id,
        titulo: this.form.titulo,
        descricao: this.form.descricao || null,
        tipo: this.form.tipo,
        inicio: new Date(this.form.inicio).toISOString(),
        fim: new Date(this.form.fim).toISOString(),
        salaId: this.form.salaId || null,
        salaTexto: this.form.salaTexto || null,
        palestrantes: Array.isArray(this.form.palestrantes) ? this.form.palestrantes : [],
        cargaHoraria: this.form.cargaHoraria !== null && this.form.cargaHoraria !== '' ? Number(this.form.cargaHoraria) : null,
        capacidadeMax: this.form.capacidadeMax ? Number(this.form.capacidadeMax) : null
      }
    },
    async salvar() {
      this.salvando = true
      this.erroForm = null
      try {
        const payload = this.payload()
        if (this.editandoId) {
          const { eventoId, ...rest } = payload
          await atividadeService.atualizar(this.editandoId, rest)
          toastService.success('Atividade atualizada com sucesso.')
        } else {
          await atividadeService.criar(payload)
          toastService.success('Atividade cadastrada com sucesso.')
        }
        this.fecharForm()
        await this.carregarTudo()
      } catch (error) {
        this.erroForm = error.message || 'Erro ao salvar atividade.'
      } finally {
        this.salvando = false
      }
    },
    pedirExclusao(atividade) {
      this.atividadeParaExcluir = atividade
    },
    async confirmarExclusao() {
      const atividade = this.atividadeParaExcluir
      if (!atividade) return
      try {
        await atividadeService.excluir(atividade._id)
        toastService.success('Atividade excluida com sucesso.')
        this.atividadeParaExcluir = null
        await this.carregarTudo()
      } catch (error) {
        toastService.error(error.message || 'Erro ao excluir atividade.')
        this.atividadeParaExcluir = null
      }
    }
  }
}
</script>

<style scoped>
.timeline-atividades {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 18px;
  padding: 18px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.timeline-item:hover {
  border-color: var(--color-primary-soft-strong);
  border-left-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.timeline-horario {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.timeline-horario strong {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.timeline-horario span {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-subtle);
}

.timeline-conteudo {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timeline-titulo {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
  margin: 4px 0 2px;
}

.timeline-descricao {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.55;
}

.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.timeline-meta-item strong {
  font-weight: 600;
  color: var(--color-text);
  margin-right: 4px;
}

.checkbox-lista-grid {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.checkbox-opcao-compact {
  padding: 8px 12px;
}

@media (max-width: 600px) {
  .timeline-item {
    grid-template-columns: 1fr;
    border-left-width: 4px;
  }
  .timeline-horario {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
}
</style>
