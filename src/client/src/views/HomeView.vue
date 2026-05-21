<template>
  <div>
    <div class="page-header page-header-acoes">
      <h1>Proximos Eventos</h1>
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
            <label>Status</label>
            <select v-model="form.status">
              <option value="rascunho">Rascunho</option>
              <option value="aberto">Aberto</option>
              <option value="encerrado">Encerrado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
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
          <option value="rascunho">Rascunho</option>
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
            <span :class="['status-tag', `status-${evento.status}`]">{{ formatarStatus(evento.status) }}</span>
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

          <p class="evento-vagas">{{ evento.vagas }} vagas totais</p>

          <div class="card-acoes">
            <button class="btn-inscrever" :disabled="evento.status !== 'aberto'" @click="irParaEvento(evento._id)">
              {{ evento.status === 'aberto' ? 'Inscrever-se' : 'Indisponivel' }}
            </button>
            <router-link :to="`/eventos/${evento._id}`" class="btn-detalhe">Ver detalhes</router-link>
          </div>

          <div v-if="podeGerenciar" class="card-acoes">
            <button type="button" class="btn-mini" @click="editar(evento)">Editar</button>
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
import { eventoService } from '@/services/eventoService'
import { palestranteService } from '@/services/palestranteService'
import { formatarData, formatarStatus, toDateInputValue } from '@/utils/formatters'

const formInicial = () => ({
  titulo: '',
  descricao: '',
  data: '',
  horarioInicio: '',
  horarioFim: '',
  local: '',
  cargaHoraria: 1,
  vagas: 1,
  categoriaId: '',
  palestrantes: [],
  status: 'rascunho',
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
      eventoParaExcluir: null
    }
  },
  computed: {
    podeGerenciar() {
      const usuario = authStorage.getUser()
      return ['admin', 'organizador'].includes(usuario?.tipoPerfil)
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
        vagas: Number(this.form.vagas)
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
        categoriaId: typeof evento.categoriaId === 'object' ? evento.categoriaId._id : evento.categoriaId,
        palestrantes: (evento.palestrantes || []).map((palestrante) => (
          typeof palestrante === 'object' ? palestrante._id : palestrante
        )),
        status: evento.status,
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
