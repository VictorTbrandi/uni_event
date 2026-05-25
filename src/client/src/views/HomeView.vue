<template>
  <div class="home-view">
    <section class="home-hero">
      <div class="home-hero-inner">
        <div class="home-hero-folio">
          <span><strong>UniEvent</strong> &nbsp;·&nbsp; Boletim Acadêmico</span>
          <span class="home-hero-folio-divisor" aria-hidden="true"></span>
          <span>{{ folioEdicao }}</span>
        </div>

        <div class="home-hero-conteudo">
          <h1 class="home-hero-titulo">
            Os melhores<br />
            <em>eventos</em><span class="home-hero-titulo-asterisco" aria-hidden="true">✦</span> da semana,
            <br />reunidos aqui.
          </h1>
          <p class="home-hero-subtitulo">
            Um caderno vivo de palestras, oficinas e encontros — atualizado por quem organiza, lido por quem aprende.
          </p>
          <p class="home-hero-subtitulo">
            Descubra eventos do seu interesse, ou registre os seus próprios usando o UniEvent.
          </p>
        </div>

        <div class="home-hero-rodape">
          <span>{{ eventos.length || '—' }} eventos catalogados</span>
          <span>{{ categorias.length || '—' }} áreas de conhecimento</span>
          <span>Inscrições abertas</span>
          <span>Certificação digital</span>
        </div>
      </div>
    </section>

    <section class="home-search-wrapper">
      <div class="home-search-card">
          <form class="home-search-form" @submit.prevent>
            <input
              v-model="filtros.busca"
              type="search"
              placeholder="Pesquisar por eventos"
              class="home-search-input"
              aria-label="Pesquisar por eventos"
            />
            <button type="submit" class="home-search-submit">
              <IconSearch :size="18" stroke-width="2" aria-hidden="true" />
              Encontrar
            </button>
          </form>

          <div class="home-search-chips" ref="filtrosChips">
            <details
              class="home-chip"
              :open="dropdownAberto === 'categoria'"
              @toggle="onToggleDropdown('categoria', $event)"
            >
              <summary>Categoria <IconChevronDown :size="14" stroke-width="2" aria-hidden="true" /></summary>
              <div class="home-chip-painel">
                <label class="home-chip-opcao">
                  <input
                    v-model="filtros.categoriaId"
                    type="radio"
                    name="categoria"
                    value=""
                  />
                  Todas
                </label>
                <label
                  v-for="categoria in categorias"
                  :key="categoria._id"
                  class="home-chip-opcao"
                >
                  <input
                    v-model="filtros.categoriaId"
                    type="radio"
                    name="categoria"
                    :value="categoria._id"
                  />
                  {{ categoria.nome }}
                </label>
              </div>
            </details>

            <details
              class="home-chip"
              :open="dropdownAberto === 'status'"
              @toggle="onToggleDropdown('status', $event)"
            >
              <summary>Status <IconChevronDown :size="14" stroke-width="2" aria-hidden="true" /></summary>
              <div class="home-chip-painel">
                <label class="home-chip-opcao">
                  <input v-model="filtros.status" type="radio" name="status" value="" />
                  Todos
                </label>
                <label class="home-chip-opcao">
                  <input v-model="filtros.status" type="radio" name="status" value="aberto" />
                  Aberto
                </label>
                <label class="home-chip-opcao">
                  <input v-model="filtros.status" type="radio" name="status" value="fechado" />
                  Fechado
                </label>
                <label class="home-chip-opcao">
                  <input v-model="filtros.status" type="radio" name="status" value="encerrado" />
                  Encerrado
                </label>
                <label class="home-chip-opcao">
                  <input v-model="filtros.status" type="radio" name="status" value="cancelado" />
                  Cancelado
                </label>
              </div>
            </details>

            <label class="home-chip home-chip-data">
              <span class="home-chip-label">Data</span>
              <input v-model="filtros.data" type="date" />
            </label>

            <button
              v-if="temFiltrosAtivos"
              type="button"
              class="home-chip home-chip-limpar"
              @click="limparFiltros"
            >
              Limpar
            </button>
          </div>
      </div>
    </section>

    <section v-if="podeGerenciar" class="home-acoes-gestor">
      <div class="home-acoes-info">
        <span class="role-pill">Modo gestor</span>
        <p class="texto-suave">Cadastre, edite e acompanhe eventos nesta mesma tela.</p>
      </div>
      <button
        type="button"
        class="btn-submit btn-header"
        :disabled="mostrandoForm"
        @click="abrirCadastro"
      >
        {{ mostrandoForm ? 'Formulário aberto' : 'Cadastrar evento' }}
      </button>
    </section>

    <section v-if="mostrandoForm" class="painel-card crud-form-card">
      <h2>{{ editandoId ? 'Editar evento' : 'Cadastrar evento' }}</h2>
      <div v-if="erroForm" class="estado-erro form-erro">{{ erroForm }}</div>
      <div v-if="!carregando && categorias.length === 0" class="estado-erro form-erro">
        Cadastre pelo menos uma categoria antes de criar eventos. O campo Categoria é obrigatório.
      </div>

      <form @submit.prevent="salvar">
        <div class="form-group">
          <label>Imagem do evento</label>
          <div class="upload-imagem">
            <div class="upload-imagem-preview">
              <img
                v-if="previewImagem"
                :src="previewImagem"
                alt="Pré-visualização da imagem do evento"
              />
              <span v-else class="upload-imagem-placeholder">Sem imagem</span>
            </div>

            <div class="upload-imagem-acoes">
              <label class="btn-secundario upload-imagem-btn">
                {{ enviandoImagem ? 'Enviando...' : (form.imagemUrl ? 'Trocar imagem' : 'Selecionar imagem') }}
                <input
                  ref="inputImagem"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  hidden
                  :disabled="enviandoImagem"
                  @change="onArquivoSelecionado"
                />
              </label>
              <button
                v-if="form.imagemUrl"
                type="button"
                class="btn-mini btn-mini-perigo"
                :disabled="enviandoImagem"
                @click="removerImagem"
              >
                Remover
              </button>
              <p class="texto-suave texto-formulario">
                PNG, JPG, WEBP ou GIF. Tamanho máximo 5 MB.
              </p>
              <p v-if="erroImagem" class="texto-erro-inline">{{ erroImagem }}</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Título</label>
          <input v-model="form.titulo" type="text" required />
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea v-model="form.descricao" rows="4" required></textarea>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Data</label>
            <input v-model="form.data" type="date" :min="dataMinima" required />
          </div>
          <div class="form-group">
            <label>Início</label>
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
          <h3>Localização e clima</h3>
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
            Cidade e UF identificam melhor o evento na agenda. Se a consulta estiver ativa, também serão usadas para buscar o clima.
          </p>
          <label class="checkbox-linha">
            <input v-model="form.previsaoTempoAtiva" type="checkbox" />
            Consultar previsão do tempo neste evento
          </label>
          <div v-if="form.previsaoTempoAtiva" class="previsao-form-acoes">
            <button
              type="button"
              class="btn-secundario"
              :disabled="carregandoPrevisaoFormulario"
              @click="consultarPrevisaoFormulario"
            >
              {{ carregandoPrevisaoFormulario ? 'Consultando...' : 'Consultar prévia do clima' }}
            </button>
            <span class="texto-suave">A prévia não salva o evento.</span>
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
                <strong>Condição</strong>
                <span>{{ previsaoFormulario.condicaoTempo || '-' }}</span>
              </div>
              <div>
                <strong>Temperatura</strong>
                <span>{{ formatTemp(previsaoFormulario.temperaturaHorario) }}</span>
              </div>
              <div>
                <strong>Chuva no horário</strong>
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
            <label>Carga horária</label>
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
            <label>Inscrições</label>
            <select v-model="form.status">
              <option v-for="opcao in opcoesStatusFormulario" :key="opcao.valor" :value="opcao.valor">
                {{ opcao.rotulo }}
              </option>
            </select>
          </div>
        </div>

        <section class="subsecao-form">
          <h3>Vínculo institucional (opcional)</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Universidade</label>
              <select v-model="form.universidadeId">
                <option value="">Sem vínculo</option>
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
            Vincular o evento a uma universidade ajuda os participantes a encontrá-lo na agenda institucional.
          </p>
        </section>

        <div v-if="form.status === 'aberto'" class="form-group">
          <label>Encerrar inscrições em</label>
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
          <button type="submit" :disabled="salvando || categorias.length === 0 || enviandoImagem" class="btn-submit">
            {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar alterações' : 'Cadastrar') }}
          </button>
          <button type="button" class="btn-secundario" @click="fecharForm">Cancelar</button>
        </div>
      </form>
    </section>

    <section class="home-secao">
      <div class="home-secao-cabecalho">
        <h2>Eventos em destaque</h2>
      </div>

      <div v-if="carregando" class="estado-loading">Carregando eventos...</div>
      <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
      <div v-else-if="eventosDestaque.length === 0" class="estado-vazio">
        Nenhum evento em destaque.
      </div>

      <div v-else class="eventos-container eventos-container-destaque">
        <EventoCard
          v-for="evento in eventosDestaque"
          :key="evento._id"
          :evento="evento"
        >
          <template #acoes="{ evento: ev }">
            <button
              type="button"
              class="btn-inscrever evento-card-inscrever"
              :disabled="!inscricaoDisponivel(ev)"
              @click="irParaEvento(ev._id)"
            >
              {{ inscricaoDisponivel(ev) ? 'Inscrever-se' : 'Indisponível' }}
            </button>
          </template>
        </EventoCard>
      </div>
    </section>

    <section v-if="categorias.length" class="home-secao">
      <div class="home-secao-cabecalho">
        <h2>Encontre eventos na sua área</h2>
      </div>
      <div class="categorias-grid">
        <button
          v-for="(categoria, idx) in categorias.slice(0, 8)"
          :key="categoria._id"
          type="button"
          :class="['categoria-card', `categoria-tema-${idx % 6}`]"
          @click="filtrarPorCategoria(categoria._id)"
        >
          <component
            :is="iconeCategoria(idx)"
            :size="32"
            stroke-width="1.6"
            class="categoria-card-icone"
            aria-hidden="true"
          />
          <span class="categoria-card-nome">{{ categoria.nome }}</span>
        </button>
      </div>
    </section>

    <section v-if="!carregando && !erro && eventosFiltrados.length > 0" class="home-secao">
      <div class="home-secao-cabecalho">
        <h2>Todos os eventos</h2>
        <span class="texto-suave">{{ eventosFiltrados.length }} {{ eventosFiltrados.length === 1 ? 'evento' : 'eventos' }}</span>
      </div>

      <div class="eventos-container">
        <article
          v-for="evento in eventosFiltrados"
          :key="evento._id"
          class="evento-card-wrapper"
        >
          <EventoCard :evento="evento">
            <template #acoes="{ evento: ev }">
              <button
                type="button"
                class="btn-inscrever evento-card-inscrever"
                :disabled="!inscricaoDisponivel(ev)"
                @click="irParaEvento(ev._id)"
              >
                {{ inscricaoDisponivel(ev) ? 'Inscrever-se' : 'Inscrições fechadas' }}
              </button>
            </template>
          </EventoCard>

          <div v-if="podeGerenciar" class="card-acoes card-acoes-admin evento-card-admin">
            <button type="button" class="btn-mini" @click="editar(evento)">Editar</button>
            <router-link
              class="btn-mini-link"
              :to="{ name: 'evento-programacao', params: { id: evento._id } }"
            >
              Programação
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
        </article>
      </div>
    </section>

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
import {
  IconSearch,
  IconChevronDown,
  IconSchool,
  IconBriefcase,
  IconPalette,
  IconMicroscope,
  IconScale,
  IconStethoscope,
  IconDeviceLaptop,
  IconBooks
} from '@tabler/icons-vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import EventoCard from '@/components/EventoCard.vue'
import { authStorage } from '@/services/api'
import { categoriaService } from '@/services/categoriaService'
import { certificadoService } from '@/services/certificadoService'
import { eventoService } from '@/services/eventoService'
import { palestranteService } from '@/services/palestranteService'
import { universidadeService } from '@/services/universidadeService'
import { departamentoService } from '@/services/departamentoService'
import { campusService } from '@/services/campusService'
import { toastService } from '@/services/toastService'
import { uploadService } from '@/services/uploadService'
import {
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
  permiteCertificado: true,
  imagemUrl: ''
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

const ICONES_CATEGORIA = [
  IconSchool,
  IconBriefcase,
  IconPalette,
  IconMicroscope,
  IconScale,
  IconStethoscope,
  IconDeviceLaptop,
  IconBooks
]

export default {
  name: 'HomeView',
  components: {
    ConfirmModal,
    EventoCard,
    IconSearch,
    IconChevronDown
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
      dropdownAberto: null,
      carregando: true,
      salvando: false,
      carregandoPrevisaoFormulario: false,
      erro: null,
      erroForm: null,
      sucesso: null,
      eventoParaExcluir: null,
      emitindoCertificadosId: null,
      enviandoImagem: false,
      erroImagem: null
    }
  },
  computed: {
    ufs() {
      return ufsBrasil
    },
    usuario() {
      return authStorage.getUser()
    },
    folioEdicao() {
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
      const agora = new Date()
      const mes = meses[agora.getMonth()]
      const ano = agora.getFullYear()
      const semana = Math.ceil(((agora - new Date(agora.getFullYear(), 0, 1)) / 86400000 + 1) / 7)
      return `EDIÇÃO Nº ${String(semana).padStart(2, '0')}  ·  ${mes} · ${ano}`
    },
    podeGerenciar() {
      return ['admin', 'organizador'].includes(this.usuario?.tipoPerfil)
    },
    mensagemExclusao() {
      const titulo = this.eventoParaExcluir?.titulo || 'este evento'
      return `Tem certeza que deseja excluir "${titulo}"? Essa ação não pode ser desfeita.`
    },
    temFiltrosAtivos() {
      return Boolean(
        this.filtros.busca ||
        this.filtros.categoriaId ||
        this.filtros.status ||
        this.filtros.data
      )
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
    eventosDestaque() {
      return this.eventosFiltrados.slice(0, 4)
    },
    previewImagem() {
      return uploadService.resolveUrl(this.form.imagemUrl)
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
  mounted() {
    document.addEventListener('click', this.onDocumentoClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onDocumentoClick)
  },
  methods: {
    formatarStatus,
    formatarMotivoFechamento,
    iconeCategoria(index) {
      return ICONES_CATEGORIA[index % ICONES_CATEGORIA.length]
    },
    onToggleDropdown(nome, event) {
      if (event.target.open) {
        this.dropdownAberto = nome
      } else if (this.dropdownAberto === nome) {
        this.dropdownAberto = null
      }
    },
    onDocumentoClick(event) {
      if (!this.dropdownAberto) return
      const container = this.$refs.filtrosChips
      if (container && !container.contains(event.target)) {
        this.dropdownAberto = null
      }
    },
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
        this.erro = error.message || 'Não foi possível conectar ao servidor.'
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
            mensagem: 'Previsão do tempo indisponível'
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
      if (this.mostrandoForm) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      this.resetarForm()
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
    },
    async onArquivoSelecionado(event) {
      const arquivo = event.target.files?.[0]
      event.target.value = ''
      if (!arquivo) return

      this.erroImagem = null
      this.enviandoImagem = true
      try {
        const resposta = await uploadService.enviarImagemEvento(arquivo)
        this.form.imagemUrl = resposta.url
      } catch (error) {
        this.erroImagem = error.message || 'Não foi possível enviar a imagem.'
      } finally {
        this.enviandoImagem = false
      }
    },
    removerImagem() {
      this.form.imagemUrl = ''
      this.erroImagem = null
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
        campusId: this.form.campusId || null,
        imagemUrl: this.form.imagemUrl || null
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
          this.erroForm = 'Não é permitido cadastrar ou editar eventos com data e hora retroativas.'
          return
        }

        const cidade = this.form.cidade?.trim()
        const uf = this.form.uf?.trim()

        if (this.form.previsaoTempoAtiva && (!cidade || !uf)) {
          this.erroForm = 'Informe cidade e UF para consultar a previsão do tempo.'
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
        status: ['aberto', 'cancelado'].includes(evento.statusConfigurado || evento.status)
          ? (evento.statusConfigurado || evento.status)
          : 'fechado',
        permiteCertificado: evento.permiteCertificado,
        imagemUrl: evento.imagemUrl || ''
      }
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
      this.previsaoFormulario = null
      this.erroImagem = null
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
        toastService.success('Evento excluído com sucesso.')
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
      this.erroImagem = null
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
        this.erroForm = 'Informe data, horário de início, cidade e UF para consultar a prévia do clima.'
        return
      }

      this.carregandoPrevisaoFormulario = true
      try {
        this.previsaoFormulario = await eventoService.previsaoChuvaPreview({
          titulo: this.form.titulo || 'Prévia do evento',
          data: this.form.data,
          horarioInicio: this.form.horarioInicio,
          horarioFim: this.form.horarioFim,
          cidade,
          uf
        })
      } catch (error) {
        this.erroForm = error.message || 'Não foi possível consultar a previsão do tempo no momento.'
      } finally {
        this.carregandoPrevisaoFormulario = false
      }
    },
    idCategoria(evento) {
      return typeof evento.categoriaId === 'object' ? evento.categoriaId._id : evento.categoriaId
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
    localidadePrevisao(previsao) {
      return [previsao?.cidade, previsao?.uf].filter(Boolean).join('/') || 'Localização consultada'
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
        INDISPONIVEL: 'Indisponível'
      }
      return labels[risco] || 'Indisponível'
    },
    formatPercent(value) {
      return Number.isFinite(Number(value)) ? `${Number(value)}%` : '-'
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
    filtrarPorCategoria(categoriaId) {
      this.filtros.categoriaId = categoriaId
      this.$nextTick(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      })
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
