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
            <input v-model="form.data" type="date" :min="dataMinima" required />
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
        <section class="subsecao-form">
          <h3>Localizacao e clima</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Cidade</label>
              <input v-model="form.cidade" type="text" :required="form.previsaoTempoAtiva" />
            </div>
            <div class="form-group">
              <label>UF</label>
              <select v-model="form.uf" :required="form.previsaoTempoAtiva">
                <option value="">Selecione</option>
                <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
              </select>
            </div>
          </div>
          <p class="texto-suave texto-formulario">
            Cidade e UF identificam melhor o evento na agenda. Se a consulta estiver ativa, tambem serao usadas para buscar o clima.
          </p>
          <label class="checkbox-linha">
            <input v-model="form.previsaoTempoAtiva" type="checkbox" />
            Consultar previsao do tempo neste evento
          </label>
          <div v-if="form.previsaoTempoAtiva" class="previsao-form-acoes">
            <button
              type="button"
              class="btn-secundario"
              :disabled="carregandoPrevisaoFormulario"
              @click="consultarPrevisaoFormulario"
            >
              {{ carregandoPrevisaoFormulario ? 'Consultando...' : 'Consultar previa do clima' }}
            </button>
            <span class="texto-suave">A previa nao salva o evento.</span>
          </div>
          <div v-if="previsaoFormulario" class="previsao-detalhe previsao-form-preview">
            <div class="linha-entre">
              <span :class="['previsao-badge', riscoPrevisaoClasse(previsaoFormulario)]">
                {{ labelRisco(previsaoFormulario.nivelRisco) }}
              </span>
              <span class="texto-suave">{{ localidadePrevisao(previsaoFormulario) }}</span>
            </div>
            <p class="previsao-mensagem">{{ previsaoFormulario.mensagem }}</p>
            <div v-if="previsaoFormulario.previsaoDisponivel" class="previsao-grid">
              <div>
                <strong>Condicao</strong>
                <span>{{ previsaoFormulario.condicaoTempo || '-' }}</span>
              </div>
              <div>
                <strong>Temperatura</strong>
                <span>{{ formatTemp(previsaoFormulario.temperaturaHorario) }}</span>
              </div>
              <div>
                <strong>Chuva no horario</strong>
                <span>{{ formatPercent(previsaoFormulario.probabilidadeChuvaHorario) }}</span>
              </div>
              <div>
                <strong>Vento</strong>
                <span>{{ formatWind(previsaoFormulario.ventoHorarioKmH) }}</span>
              </div>
            </div>
          </div>
        </section>
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
              <option v-for="opcao in opcoesStatusFormulario" :key="opcao.valor" :value="opcao.valor">
                {{ opcao.rotulo }}
              </option>
            </select>
          </div>
        </div>
        <section class="subsecao-form">
          <h3>Vinculo institucional (opcional)</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Universidade</label>
              <select v-model="form.universidadeId">
                <option value="">Sem vinculo</option>
                <option v-for="u in universidades" :key="u._id" :value="u._id">{{ u.sigla }} - {{ u.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <select v-model="form.departamentoId" :disabled="!form.universidadeId">
                <option value="">Sem departamento</option>
                <option v-for="d in departamentosFiltrados" :key="d._id" :value="d._id">{{ d.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Campus</label>
              <select v-model="form.campusId" :disabled="!form.universidadeId">
                <option value="">Sem campus</option>
                <option v-for="c in campiFiltrados" :key="c._id" :value="c._id">{{ c.nome }}</option>
              </select>
            </div>
          </div>
          <p class="texto-suave texto-formulario">
            Vincular o evento a uma universidade ajuda os participantes a encontra-lo na agenda institucional.
          </p>
        </section>
        <div v-if="form.status === 'aberto'" class="form-group">
          <label>Encerrar inscricoes em</label>
          <input v-model="form.inscricoesEncerramEm" type="datetime-local" :min="dataHoraMinima" required />
        </div>
        <div class="form-group">
          <label>Palestrantes</label>
          <div v-if="palestrantes.length" class="checkbox-lista">
            <label v-for="palestrante in palestrantes" :key="palestrante._id" class="checkbox-opcao">
              <input v-model="form.palestrantes" type="checkbox" :value="palestrante._id" />
              <span>
                <strong>{{ palestrante.nome }}</strong>
                <small>{{ descricaoPalestrante(palestrante) }}</small>
              </span>
            </label>
          </div>
          <p v-else class="texto-suave texto-formulario">
            Nenhum palestrante cadastrado. O evento pode ser salvo sem palestrantes.
          </p>
          <p v-if="palestrantes.length && form.palestrantes.length === 0" class="texto-suave texto-formulario">
            Nenhum palestrante selecionado.
          </p>
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
        <input v-model="filtros.busca" type="search" placeholder="Titulo, local ou cidade" />
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
          <div v-if="cidadeEvento(evento)" class="evento-info">
            <span class="icone">Cidade</span>
            <span>{{ cidadeEvento(evento) }}</span>
          </div>
          <div v-if="rotuloUniversidadeEvento(evento)" class="evento-info">
            <span class="icone">Uni.</span>
            <span>{{ rotuloUniversidadeEvento(evento) }}</span>
          </div>
          <div v-if="rotuloCampusEvento(evento)" class="evento-info">
            <span class="icone">Campus</span>
            <span>{{ rotuloCampusEvento(evento) }}</span>
          </div>
          <div v-if="evento.previsaoTempoAtiva" class="evento-info evento-info-clima">
            <span class="icone">Clima</span>
            <span :class="['previsao-badge', riscoPrevisaoClasse(previsaoCard(evento))]">
              {{ resumoPrevisaoCard(evento) }}
            </span>
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
              :to="{ name: 'evento-programacao', params: { id: evento._id } }"
            >
              Programacao
            </router-link>
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
import { universidadeService } from '@/services/universidadeService'
import { departamentoService } from '@/services/departamentoService'
import { campusService } from '@/services/campusService'
import { toastService } from '@/services/toastService'
import {
  formatarData,
  formatarDataHora,
  formatarMotivoFechamento,
  formatarStatus,
  toDateInputValue,
  toDateTimeInputValue
} from '@/utils/formatters'
import { mensagemEmissaoCertificados } from '@/utils/certificados'

const formInicial = () => ({
  titulo: '',
  descricao: '',
  data: '',
  horarioInicio: '',
  horarioFim: '',
  local: '',
  cidade: '',
  uf: '',
  previsaoTempoAtiva: false,
  cargaHoraria: 1,
  vagas: 1,
  inscricoesEncerramEm: '',
  categoriaId: '',
  universidadeId: '',
  departamentoId: '',
  campusId: '',
  palestrantes: [],
  status: 'fechado',
  permiteCertificado: true
})

const idDeRef = (ref) => (ref && typeof ref === 'object' ? ref._id : ref)

const toLocalInputDateTime = (date = new Date()) => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

const combineFormDateAndTime = (data, horario) => {
  if (!data || !horario) return null
  const [ano, mes, dia] = data.split('-').map(Number)
  const [hora, minuto] = horario.split(':').map(Number)

  if (![ano, mes, dia, hora, minuto].every(Number.isInteger)) return null
  return new Date(ano, mes - 1, dia, hora, minuto, 0, 0)
}

const ufsBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

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
      universidades: [],
      departamentos: [],
      campi: [],
      previsoesChuva: {},
      previsaoFormulario: null,
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
      carregandoPrevisaoFormulario: false,
      erro: null,
      erroForm: null,
      sucesso: null,
      eventoParaExcluir: null,
      emitindoCertificadosId: null
    }
  },
  computed: {
    ufs() {
      return ufsBrasil
    },
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
        const textoBusca = [
          evento.titulo,
          evento.local,
          evento.cidade,
          evento.uf
        ].filter(Boolean).join(' ').toLowerCase()

        return (
          (!busca || textoBusca.includes(busca)) &&
          (!this.filtros.categoriaId || categoriaId === this.filtros.categoriaId) &&
          (!this.filtros.status || evento.status === this.filtros.status) &&
          (!this.filtros.data || dataEvento === this.filtros.data)
        )
      })
    },
    dataMinima() {
      return toLocalInputDateTime().slice(0, 10)
    },
    dataHoraMinima() {
      return toLocalInputDateTime()
    },
    opcoesStatusFormulario() {
      const opcoes = [
        { valor: 'fechado', rotulo: 'Fechadas' },
        { valor: 'aberto', rotulo: 'Abertas' }
      ]

      if (this.editandoId) {
        opcoes.push({ valor: 'cancelado', rotulo: 'Cancelado' })
      }

      return opcoes
    },
    departamentosFiltrados() {
      if (!this.form.universidadeId) return []
      return this.departamentos.filter((d) => idDeRef(d.universidadeId) === this.form.universidadeId)
    },
    campiFiltrados() {
      if (!this.form.universidadeId) return []
      return this.campi.filter((c) => idDeRef(c.universidadeId) === this.form.universidadeId)
    }
  },
  watch: {
    '$route.query.categoria': {
      immediate: true,
      handler(categoriaId) {
        this.filtros.categoriaId = categoriaId || ''
      }
    },
    'form.data': 'limparPrevisaoFormulario',
    'form.horarioInicio': 'limparPrevisaoFormulario',
    'form.cidade': 'limparPrevisaoFormulario',
    'form.uf': 'limparPrevisaoFormulario',
    'form.previsaoTempoAtiva'(ativa) {
      if (!ativa) this.limparPrevisaoFormulario()
    },
    'form.universidadeId'(novoValor, valorAnterior) {
      if (novoValor !== valorAnterior) {
        const depOk = this.departamentos.some(
          (d) => d._id === this.form.departamentoId && idDeRef(d.universidadeId) === novoValor
        )
        if (!depOk) this.form.departamentoId = ''

        const campusOk = this.campi.some(
          (c) => c._id === this.form.campusId && idDeRef(c.universidadeId) === novoValor
        )
        if (!campusOk) this.form.campusId = ''
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
      this.previsoesChuva = {}

      try {
        const [eventos, categorias, palestrantes, universidades, departamentos, campi] = await Promise.all([
          eventoService.listar(),
          categoriaService.listar(),
          palestranteService.listar(),
          universidadeService.listar(),
          departamentoService.listar(),
          campusService.listar()
        ])
        this.eventos = eventos
        this.categorias = categorias
        this.palestrantes = palestrantes
        this.universidades = universidades
        this.departamentos = departamentos
        this.campi = campi
        this.carregarPrevisoesChuva()
      } catch (error) {
        this.erro = error.message || 'Nao foi possivel conectar ao servidor.'
      } finally {
        this.carregando = false
      }
    },
    async carregarPrevisoesChuva() {
      const eventosComPrevisao = this.eventos.filter((evento) => evento.previsaoTempoAtiva)

      await Promise.all(eventosComPrevisao.map(async (evento) => {
        try {
          const previsao = await eventoService.previsaoChuva(evento._id)
          this.registrarPrevisaoCard(evento._id, previsao)
        } catch (error) {
          this.registrarPrevisaoCard(evento._id, {
            previsaoDisponivel: false,
            nivelRisco: 'INDISPONIVEL',
            mensagem: 'Previsao do tempo indisponivel'
          })
        }
      }))
    },
    registrarPrevisaoCard(eventoId, previsao) {
      this.previsoesChuva = {
        ...this.previsoesChuva,
        [eventoId]: previsao
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
        cidade: this.form.cidade ? this.form.cidade.trim() : null,
        uf: this.form.uf ? this.form.uf.trim().toUpperCase() : null,
        palestrantes: Array.isArray(this.form.palestrantes) ? this.form.palestrantes : [],
        inscricoesEncerramEm: this.form.status === 'aberto' ? this.form.inscricoesEncerramEm : null,
        universidadeId: this.form.universidadeId || null,
        departamentoId: this.form.departamentoId || null,
        campusId: this.form.campusId || null
      }
    },
    async salvar() {
      this.salvando = true
      this.erroForm = null
      this.sucesso = null

      try {
        const inicio = combineFormDateAndTime(this.form.data, this.form.horarioInicio)
        const agora = new Date()
        agora.setSeconds(0, 0)

        if (!inicio || inicio < agora) {
          this.erroForm = 'Nao e permitido cadastrar ou editar eventos com data e hora retroativas.'
          return
        }

        const cidade = this.form.cidade?.trim()
        const uf = this.form.uf?.trim()

        if (this.form.previsaoTempoAtiva && (!cidade || !uf)) {
          this.erroForm = 'Informe cidade e UF para consultar a previsao do tempo.'
          return
        }

        if (this.editandoId) {
          await eventoService.atualizar(this.editandoId, this.payload())
          toastService.success('Evento atualizado com sucesso.')
        } else {
          await eventoService.criar(this.payload())
          toastService.success('Evento cadastrado com sucesso.')
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
        cidade: evento.cidade || '',
        uf: evento.uf || '',
        previsaoTempoAtiva: Boolean(evento.previsaoTempoAtiva),
        cargaHoraria: evento.cargaHoraria,
        vagas: evento.vagas,
        inscricoesEncerramEm: toDateTimeInputValue(evento.inscricoesEncerramEm),
        categoriaId: typeof evento.categoriaId === 'object' ? evento.categoriaId._id : evento.categoriaId,
        universidadeId: idDeRef(evento.universidadeId) || '',
        departamentoId: idDeRef(evento.departamentoId) || '',
        campusId: idDeRef(evento.campusId) || '',
        palestrantes: (evento.palestrantes || []).map((palestrante) => (
          typeof palestrante === 'object' ? palestrante._id : palestrante
        )),
        status: ['aberto', 'cancelado'].includes(evento.status) ? evento.status : 'fechado',
        permiteCertificado: evento.permiteCertificado
      }
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
      this.previsaoFormulario = null
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
        toastService.success('Evento excluido com sucesso.')
        await this.carregarDados()
      } catch (error) {
        toastService.error(error.message || 'Erro ao excluir evento.')
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
      this.previsaoFormulario = null
      this.carregandoPrevisaoFormulario = false
    },
    limparPrevisaoFormulario() {
      this.previsaoFormulario = null
    },
    async consultarPrevisaoFormulario() {
      this.erroForm = null
      this.previsaoFormulario = null

      const cidade = this.form.cidade?.trim()
      const uf = this.form.uf?.trim().toUpperCase()

      if (!this.form.data || !this.form.horarioInicio || !cidade || !uf) {
        this.erroForm = 'Informe data, horario de inicio, cidade e UF para consultar a previa do clima.'
        return
      }

      this.carregandoPrevisaoFormulario = true
      try {
        this.previsaoFormulario = await eventoService.previsaoChuvaPreview({
          titulo: this.form.titulo || 'Previa do evento',
          data: this.form.data,
          horarioInicio: this.form.horarioInicio,
          horarioFim: this.form.horarioFim,
          cidade,
          uf
        })
      } catch (error) {
        this.erroForm = error.message || 'Nao foi possivel consultar a previsao do tempo no momento.'
      } finally {
        this.carregandoPrevisaoFormulario = false
      }
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
    descricaoPalestrante(palestrante) {
      return [palestrante.areaAtuacao, palestrante.instituicao].filter(Boolean).join(' - ') || 'Sem detalhes adicionais'
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
    cidadeEvento(evento) {
      return [evento.cidade, evento.uf].filter(Boolean).join('/')
    },
    rotuloUniversidadeEvento(evento) {
      const ref = evento.universidadeId
      if (!ref) return ''
      if (typeof ref === 'object') {
        return ref.sigla ? `${ref.sigla} - ${ref.nome}` : ref.nome
      }
      const u = this.universidades.find((x) => x._id === ref)
      return u ? `${u.sigla} - ${u.nome}` : ''
    },
    rotuloCampusEvento(evento) {
      const ref = evento.campusId
      if (!ref) return ''
      if (typeof ref === 'object') return ref.nome
      const c = this.campi.find((x) => x._id === ref)
      return c ? c.nome : ''
    },
    localidadePrevisao(previsao) {
      return [previsao?.cidade, previsao?.uf].filter(Boolean).join('/') || 'Localizacao consultada'
    },
    previsaoCard(evento) {
      return this.previsoesChuva[evento._id] || null
    },
    resumoPrevisaoCard(evento) {
      const previsao = this.previsaoCard(evento)
      if (!previsao) return 'Consultando...'
      if (!previsao.previsaoDisponivel) return 'Clima indisponivel'

      const temperatura = this.formatTemp(previsao.temperaturaHorario)
      const chuva = this.formatPercent(previsao.probabilidadeChuvaHorario)
      if (temperatura !== '-') return `${temperatura} - chuva ${chuva}`
      return `Chuva ${chuva} no horario`
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
    formatWind(value) {
      return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} km/h` : '-'
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

      try {
        const resultado = await certificadoService.emitirPorEvento(evento._id)
        toastService.success(mensagemEmissaoCertificados(resultado))
        await this.carregarDados()
      } catch (error) {
        toastService.error(error.message || 'Erro ao emitir certificados.')
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
