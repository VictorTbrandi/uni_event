<template>
  <div>
    <div class="page-header">
      <h1>Painel de Eventos</h1>
    </div>

    <div class="painel-layout">
      <section class="painel-card">
        <h2>{{ editandoId ? 'Editar evento' : 'Novo evento' }}</h2>
        <div v-if="erroForm" class="estado-erro form-erro">{{ erroForm }}</div>
        <div v-if="sucesso" class="estado-sucesso">{{ sucesso }}</div>
        <div v-if="!carregando && categorias.length === 0" class="estado-erro form-erro">
          Cadastre pelo menos uma categoria antes de criar eventos. O campo Categoria e obrigatorio.
        </div>

        <form @submit.prevent="salvar">
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
              <input v-model="form.data" type="date" required />
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
              {{ salvando ? 'Salvando...' : 'Salvar evento' }}
            </button>
            <button v-if="editandoId" type="button" class="btn-secundario" @click="resetarForm">Cancelar edição</button>
          </div>
        </form>
      </section>

      <section class="painel-card painel-card-lista">
        <h2>Eventos</h2>

        <div v-if="carregando" class="estado-loading">Carregando eventos...</div>
        <div v-else-if="erroLista" class="estado-erro">{{ erroLista }}</div>
        <div v-else-if="eventos.length === 0" class="estado-vazio">Nenhum evento cadastrado.</div>

        <div v-else class="tabela-responsiva">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="evento in eventos" :key="evento._id">
                <td>{{ evento.titulo }}</td>
                <td>{{ formatarDataCurta(evento.data) }}</td>
                <td>{{ nomeCategoria(evento) }}</td>
                <td><span :class="['status-tag', `status-${evento.status}`]">{{ formatarStatus(evento.status) }}</span></td>
                <td class="acoes-tabela">
                  <button type="button" class="btn-mini" @click="editar(evento)">Editar</button>
                  <router-link class="btn-mini-link" :to="`/painel/eventos/${evento._id}/participantes`">Participantes</router-link>
                  <router-link class="btn-mini-link" :to="`/painel/feedbacks/${evento._id}`">Feedbacks</router-link>
                  <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(evento)">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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
import { categoriaService } from '@/services/categoriaService'
import { eventoService } from '@/services/eventoService'
import { palestranteService } from '@/services/palestranteService'
import { formatarDataCurta, formatarStatus, toDateInputValue } from '@/utils/formatters'

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
  name: 'PainelEventosView',
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
      carregando: true,
      salvando: false,
      erroLista: null,
      erroForm: null,
      sucesso: null,
      eventoParaExcluir: null
    }
  },
  computed: {
    mensagemExclusao() {
      const titulo = this.eventoParaExcluir?.titulo || 'este evento'
      return `Tem certeza que deseja excluir "${titulo}"? Essa acao nao pode ser desfeita.`
    }
  },
  async created() {
    await this.carregarDados()
  },
  methods: {
    formatarDataCurta,
    formatarStatus,
    async carregarDados() {
      this.carregando = true
      this.erroLista = null

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
        this.erroLista = error.message || 'Erro ao carregar dados.'
      } finally {
        this.carregando = false
      }
    },
    nomeCategoria(evento) {
      return typeof evento.categoriaId === 'object' ? evento.categoriaId.nome : ''
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
          this.sucesso = 'Evento criado com sucesso.'
        }
        this.resetarForm()
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
        this.eventoParaExcluir = null
        await this.carregarDados()
      } catch (error) {
        this.erroLista = error.message || 'Erro ao excluir evento.'
      }
    },
    resetarForm() {
      this.form = formInicial()
      this.editandoId = null
    }
  }
}
</script>
