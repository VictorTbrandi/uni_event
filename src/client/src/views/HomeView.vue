<template>
  <div>
    <div class="page-header page-header-acoes">
      <div class="page-header-titulo">
        <div class="linha-titulo-role">
          <h1>Proximos Eventos</h1>
          <span v-if="podeGerenciar" class="role-pill">Modo gestor</span>
        </div>
        <p v-if="podeGerenciar" class="page-subtitle">
          Cadastre, edite e acompanhe eventos nesta mesma tela.
        </p>
      </div>
      <button v-if="podeGerenciar" type="button" class="btn-submit btn-header" @click="abrirCadastro">
        Cadastrar evento
      </button>
    </div>

    <section v-if="mostrandoForm" class="painel-card crud-form-card">
      <h2>{{ editandoId ? 'Editar evento' : 'Cadastrar evento' }}</h2>
      <div v-if="erroForm" class="estado-erro form-erro">{{ erroForm }}</div>
      <div v-if="sucesso" class="estado-sucesso">{{ sucesso }}</div>
      <div v-if="!carregando && categorias.length === 0" class="estado-erro form-erro">
        Cadastre pelo menos uma categoria antes de criar eventos. O campo Categoria e obrigatorio.
      </div>

      <form @submit.prevent="salvar">
        <div class="form-group">
          <label>Titulo</label>
          <input v-model="form.titulo" type="text" required />
        </div>
        <div class="form-group">
          <label>Descricao</label>
          <textarea v-model="form.descricao" rows="4" required></textarea>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Data</label>
            <input v-model="form.data" type="date" required />
          </div>
          <div class="form-group">
            <label>Inicio</label>
            <input v-model="form.horarioInicio" type="time" required />
          </div>
          <div class="form-group">
            <label>Fim</label>
            <input v-model="form.horarioFim" type="time" required />
          </div>
        </div>
        <div class="form-group">
          <label>Local</label>
          <input v-model="form.local" type="text" required />
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Carga horaria</label>
            <input v-model.number="form.cargaHoraria" type="number" min="1" required />
          </div>
          <div class="form-group">
            <label>Vagas</label>
            <input v-model.number="form.vagas" type="number" min="1" required />
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Categoria</label>
            <select v-model="form.categoriaId" required>
              <option value="">Selecione</option>
              <option v-for="categoria in categorias" :key="categoria._id" :value="categoria._id">
                {{ categoria.nome }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Inscricoes</label>
            <select v-model="form.status">
              <option value="fechado">Fechadas</option>
              <option value="aberto">Abertas</option>
              <option value="encerrado" disabled>Encerrado automaticamente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
        <div v-if="form.status === 'aberto'" class="form-group">
          <label>Encerrar inscricoes em</label>
          <input v-model="form.inscricoesEncerramEm" type="datetime-local" required />
        </div>
        <div class="form-group">
          <label>Palestrantes</label>
          <select v-model="form.palestrantes" multiple>
            <option v-for="palestrante in palestrantes" :key="palestrante._id" :value="palestrante._id">
              {{ palestrante.nome }}
            </option>
          </select>
        </div>
        <label class="checkbox-linha">
          <input v-model="form.permiteCertificado" type="checkbox" />
          Emitir certificado
        </label>

        <div class="card-acoes card-acoes-linha">
          <button type="submit" :disabled="salvando || categorias.length === 0" class="btn-submit">
            {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
          </button>
          <button type="button" class="btn-secundario" @click="fecharForm">Cancelar</button>
        </div>
      </form>
    </section>

    <div v-if="sucesso && !mostrandoForm" class="estado-sucesso">{{ sucesso }}</div>

    <section class="filtros-barra">
      <div class="form-group">
        <label>Buscar</label>
        <input v-model="filtros.busca" type="search" placeholder="Titulo do evento" />
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select v-model="filtros.categoriaId">
          <option value="">Todas</option>
          <option v-for="categoria in categorias" :key="categoria._id" :value="categoria._id">
            {{ categoria.nome }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="filtros.status">
          <option value="">Todos</option>
          <option value="aberto">Aberto</option>
          <option value="fechado">Fechado</option>
          <option value="encerrado">Encerrado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <div class="form-group">
        <label>Data</label>
        <input v-model="filtros.data" type="date" />
      </div>
      <button type="button" class="btn-secundario" @click="limparFiltros">Limpar</button>
    </section>

    <div v-if="carregando" class="estado-loading">Carregando eventos...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
    <div v-else-if="eventosFiltrados.length === 0" class="estado-vazio">
      Nenhum evento disponivel no momento.
    </div>

    <div v-else class="eventos-container">
      <article v-for="evento in eventosFiltrados" :key="evento._id" class="evento-card">
        <div class="evento-card-image">Evento</div>
        <div class="evento-card-body">
          <div class="linha-entre">
            <span class="tag">{{ nomeCategoria(evento) }}</span>
            <span :class="['status-tag', `status-${evento.status}`]">{{ statusEvento(evento) }}</span>
          </div>

          <h3>{{ evento.titulo }}</h3>

          <div class="evento-info">
            <span class="icone">Data</span>
            <span>{{ formatarData(evento.data) }}</span>
          </div>
          <div class="evento-info">
            <span class="icone">Hora</span>
            <span>{{ evento.horarioInicio }} - {{ evento.horarioFim }}</span>
          </div>
          <div class="evento-info">
            <span class="icone">Local</span>
            <span>{{ evento.local }}</span>
          </div>
          <div class="evento-info">
            <span class="icone">Palestrantes</span>
            <span>{{ nomesPalestrantes(evento) }}</span>
          </div>
          <div v-if="evento.inscricoesEncerramEm" class="evento-info">
            <span class="icone">Inscricoes</span>
            <span>ate {{ formatarDataHora(evento.inscricoesEncerramEm) }}</span>
          </div>

          <p :class="['evento-vagas', { esgotado: vagasDisponiveis(evento) === 0 }]">
            {{ vagasDisponiveis(evento) }} de {{ evento.vagas }} vagas disponiveis
          </p>

          <div class="card-acoes">
            <button class="btn-inscrever" :disabled="!inscricaoDisponivel(evento)" @click="irParaEvento(evento._id)">
              {{ inscricaoDisponivel(evento) ? 'Inscrever-se' : 'Inscricoes fechadas' }}
            </button>
            <router-link :to="`/eventos/${evento._id}`" class="btn-detalhe">Ver detalhes</router-link>
          </div>

          <div v-if="podeGerenciar" class="card-acoes card-acoes-admin">
            <button type="button" class="btn-mini" @click="editar(evento)">Editar</button>
            <router-link
              class="btn-mini-link"
              :to="{ name: 'evento-participantes', params: { id: evento._id } }"
            >
              Participantes
            </router-link>
            <router-link
              class="btn-mini-link"
              :to="{ name: 'evento-feedbacks', params: { id: evento._id } }"
            >
              Feedbacks
            </router-link>
            <button
              v-if="podeEmitirCertificados(evento)"
              type="button"
              class="btn-mini"
              :disabled="emitindoCertificadosId === evento._id"
              @click="emitirCertificados(evento)"
            >
              {{ emitindoCertificadosId === evento._id ? 'Emitindo...' : 'Emitir certificados' }}
            </button>
            <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(evento)">Excluir</button>
          </div>
        </div>
      </article>
    </div>

    <ConfirmModal
      :aberto="Boolean(eventoParaExcluir)"
      titulo="Excluir evento"
      :mensagem="mensagemExclusao"
      texto-confirmar="Excluir"
      @cancelar="eventoParaExcluir = null"
      @confirmar="confirmarExclusao"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/ConfirmModal.vue'
import { authStorage } from '@/services/api'
import { categoriaService } from '@/services/categoriaService'
import { certificadoService } from '@/services/certificadoService'
import { eventoService } from '@/services/eventoService'
import { palestranteService } from '@/services/palestranteService'
import {
  formatarData,
  formatarDataHora,
  formatarMotivoFechamento,
  formatarStatus,
  toDateInputValue,
  toDateTimeInputValue
} from '@/utils/formatters'

const formInicial = () => ({
  titulo: '',
  descricao: '',
  data: '',
  horarioInicio: '',
  horarioFim: '',
  local: '',
  cargaHoraria: 1,
  vagas: 1,
  inscricoesEncerramEm: '',
  categoriaId: '',
  palestrantes: [],
  status: 'fechado',
  permiteCertificado: true
})

export default {
  name: 'HomeView',
  components: {
    ConfirmModal
  },
  data() {
    return {
      eventos: [],
      categorias: [],
      palestrantes: [],
      form: formInicial(),
      editandoId: null,
      mostrandoForm: false,
      filtros: {
        busca: '',
        categoriaId: '',
        status: '',
        data: ''
      },
      carregando: true,
      salvando: false,
      erro: null,
      erroForm: null,
      sucesso: null,
      eventoParaExcluir: null,
      emitindoCertificadosId: null
    }
  },
  computed: {
    usuario() {
      return authStorage.getUser()
    },
    podeGerenciar() {
      return ['admin', 'organizador'].includes(this.usuario?.tipoPerfil)
    },
    mensagemExclusao() {
      const titulo = this.eventoParaExcluir?.titulo || 'este evento'
      return `Tem certeza que deseja excluir "${titulo}"? Essa acao nao pode ser desfeita.`
    },
    eventosFiltrados() {
      const busca = this.filtros.busca.trim().toLowerCase()

      return this.eventos.filter((evento) => {
        const categoriaId = this.idCategoria(evento)
        const dataEvento = toDateInputValue(evento.data)
        const titulo = evento.titulo.toLowerCase()

        return (
          (!busca || titulo.includes(busca)) &&
          (!this.filtros.categoriaId || categoriaId === this.filtros.categoriaId) &&
          (!this.filtros.status || evento.status === this.filtros.status) &&
          (!this.filtros.data || dataEvento === this.filtros.data)
        )
      })
    }
  },
  watch: {
    '$route.query.categoria': {
      immediate: true,
      handler(categoriaId) {
        this.filtros.categoriaId = categoriaId || ''
      }
    }
  },
  async created() {
    await this.carregarDados()
  },
  methods: {
    formatarData,
    formatarDataHora,
    formatarStatus,
    async carregarDados() {
      this.carregando = true
      this.erro = null

      try {
        const [eventos, categorias, palestrantes] = await Promise.all([
          eventoService.listar(),
          categoriaService.listar(),
          palestranteService.listar()
        ])
        this.eventos = eventos
        this.categorias = categorias
        this.palestrantes = palestrantes
      } catch (error) {
        this.erro = error.message || 'Nao foi possivel conectar ao servidor.'
      } finally {
        this.carregando = false
      }
    },
    abrirCadastro() {
      this.resetarForm()
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
    },
    payload() {
      return {
        ...this.form,
        cargaHoraria: Number(this.form.cargaHoraria),
        vagas: Number(this.form.vagas),
        inscricoesEncerramEm: this.form.status === 'aberto' ? this.form.inscricoesEncerramEm : null
      }
    },
    async salvar() {
      this.salvando = true
      this.erroForm = null
      this.sucesso = null

      try {
        if (this.editandoId) {
          await eventoService.atualizar(this.editandoId, this.payload())
          this.sucesso = 'Evento atualizado com sucesso.'
        } else {
          await eventoService.criar(this.payload())
          this.sucesso = 'Evento cadastrado com sucesso.'
        }
        this.resetarForm()
        this.mostrandoForm = false
        await this.carregarDados()
      } catch (error) {
        this.erroForm = error.message || 'Erro ao salvar evento.'
      } finally {
        this.salvando = false
      }
    },
    editar(evento) {
      this.editandoId = evento._id
      this.form = {
        titulo: evento.titulo,
        descricao: evento.descricao,
        data: toDateInputValue(evento.data),
        horarioInicio: evento.horarioInicio,
        horarioFim: evento.horarioFim,
        local: evento.local,
        cargaHoraria: evento.cargaHoraria,
        vagas: evento.vagas,
        inscricoesEncerramEm: toDateTimeInputValue(evento.inscricoesEncerramEm),
        categoriaId: typeof evento.categoriaId === 'object' ? evento.categoriaId._id : evento.categoriaId,
        palestrantes: (evento.palestrantes || []).map((palestrante) => (
          typeof palestrante === 'object' ? palestrante._id : palestrante
        )),
        status: evento.status === 'encerrado' ? 'encerrado' : evento.status,
        permiteCertificado: evento.permiteCertificado
      }
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    pedirExclusao(evento) {
      this.eventoParaExcluir = evento
    },
    async confirmarExclusao() {
      const evento = this.eventoParaExcluir
      if (!evento) return

      try {
        await eventoService.excluir(evento._id)
        if (this.editandoId === evento._id) {
          this.fecharForm()
        }
        this.eventoParaExcluir = null
        await this.carregarDados()
      } catch (error) {
        this.erro = error.message || 'Erro ao excluir evento.'
      }
    },
    fecharForm() {
      this.resetarForm()
      this.mostrandoForm = false
      this.erroForm = null
      this.sucesso = null
    },
    resetarForm() {
      this.form = formInicial()
      this.editandoId = null
    },
    idCategoria(evento) {
      return typeof evento.categoriaId === 'object' ? evento.categoriaId._id : evento.categoriaId
    },
    nomeCategoria(evento) {
      return typeof evento.categoriaId === 'object' ? evento.categoriaId.nome : 'Sem categoria'
    },
    nomesPalestrantes(evento) {
      const nomes = (evento.palestrantes || []).map((palestrante) => (
        typeof palestrante === 'object' ? palestrante.nome : ''
      )).filter(Boolean)

      return nomes.length ? nomes.join(', ') : 'A definir'
    },
    vagasDisponiveis(evento) {
      return Number.isFinite(Number(evento.vagasDisponiveis)) ? Number(evento.vagasDisponiveis) : Number(evento.vagas)
    },
    inscricaoDisponivel(evento) {
      return evento.status === 'aberto' && this.vagasDisponiveis(evento) > 0
    },
    statusEvento(evento) {
      if (evento.status === 'fechado' && evento.motivoFechamentoInscricao) {
        return formatarMotivoFechamento(evento.motivoFechamentoInscricao)
      }
      return formatarStatus(evento.status)
    },
    organizadorId(evento) {
      return typeof evento.organizadorId === 'object' ? evento.organizadorId._id : evento.organizadorId
    },
    podeEmitirCertificados(evento) {
      if (!this.podeGerenciar || !evento.permiteCertificado || evento.status !== 'encerrado') return false
      if (this.usuario?.tipoPerfil === 'admin') return true
      return String(this.organizadorId(evento)) === String(this.usuario?._id)
    },
    async emitirCertificados(evento) {
      this.emitindoCertificadosId = evento._id
      this.erro = null
      this.sucesso = null

      try {
        const resultado = await certificadoService.emitirPorEvento(evento._id)
        this.sucesso = `${resultado.emitidos} certificado(s) emitido(s). ${resultado.existentes} ja existiam.`
        await this.carregarDados()
      } catch (error) {
        this.erro = error.message || 'Erro ao emitir certificados.'
      } finally {
        this.emitindoCertificadosId = null
      }
    },
    limparFiltros() {
      this.filtros = { busca: '', categoriaId: '', status: '', data: '' }
      if (this.$route.query.categoria) {
        this.$router.replace({ name: 'home' })
      }
    },
    irParaEvento(id) {
      this.$router.push(`/eventos/${id}`)
    }
  }
}
</script>
