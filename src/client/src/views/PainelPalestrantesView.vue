<template>
  <div>
    <div class="page-header">
      <h1>Painel de Palestrantes</h1>
    </div>

    <div class="painel-layout">
      <section class="painel-card">
        <h2>{{ editandoId ? 'Editar palestrante' : 'Novo palestrante' }}</h2>
        <div v-if="erroForm" class="estado-erro form-erro">{{ erroForm }}</div>
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.nome" type="text" required />
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input v-model="form.email" type="email" required />
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Área de atuação</label>
              <input v-model="form.areaAtuacao" type="text" />
            </div>
            <div class="form-group">
              <label>Instituição</label>
              <input v-model="form.instituicao" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>Foto URL</label>
            <input v-model="form.fotoUrl" type="url" />
          </div>
          <div class="form-group">
            <label>Biografia</label>
            <textarea v-model="form.biografia" rows="4"></textarea>
          </div>
          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvando" class="btn-submit">
              {{ salvando ? 'Salvando...' : 'Salvar palestrante' }}
            </button>
            <button v-if="editandoId" type="button" class="btn-secundario" @click="resetarForm">Cancelar edição</button>
          </div>
        </form>
      </section>

      <section class="painel-card painel-card-lista">
        <h2>Palestrantes</h2>
        <div v-if="carregando" class="estado-loading">Carregando palestrantes...</div>
        <div v-else-if="erroLista" class="estado-erro">{{ erroLista }}</div>
        <div v-else class="lista-vertical">
          <article v-for="palestrante in palestrantes" :key="palestrante._id" class="item-linha">
            <div>
              <h3>{{ palestrante.nome }}</h3>
              <p>{{ palestrante.email }}</p>
              <p>{{ palestrante.areaAtuacao || 'Área não informada' }}</p>
            </div>
            <div class="acoes-tabela">
              <button type="button" class="btn-mini" @click="editar(palestrante)">Editar</button>
              <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(palestrante)">Excluir</button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <ConfirmModal
      :aberto="Boolean(palestranteParaExcluir)"
      titulo="Excluir palestrante"
      :mensagem="mensagemExclusao"
      texto-confirmar="Excluir"
      @cancelar="palestranteParaExcluir = null"
      @confirmar="confirmarExclusao"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/ConfirmModal.vue'
import { palestranteService } from '@/services/palestranteService'

const formInicial = () => ({
  nome: '',
  email: '',
  biografia: '',
  areaAtuacao: '',
  instituicao: '',
  fotoUrl: ''
})

export default {
  name: 'PainelPalestrantesView',
  components: {
    ConfirmModal
  },
  data() {
    return {
      palestrantes: [],
      form: formInicial(),
      editandoId: null,
      carregando: true,
      salvando: false,
      erroLista: null,
      erroForm: null,
      palestranteParaExcluir: null
    }
  },
  computed: {
    mensagemExclusao() {
      const nome = this.palestranteParaExcluir?.nome || 'este palestrante'
      return `Tem certeza que deseja excluir "${nome}"? Essa acao nao pode ser desfeita.`
    }
  },
  async created() {
    await this.carregarPalestrantes()
  },
  methods: {
    async carregarPalestrantes() {
      try {
        this.palestrantes = await palestranteService.listar()
      } catch (error) {
        this.erroLista = error.message || 'Erro ao carregar palestrantes.'
      } finally {
        this.carregando = false
      }
    },
    async salvar() {
      this.salvando = true
      this.erroForm = null

      try {
        if (this.editandoId) {
          await palestranteService.atualizar(this.editandoId, this.form)
        } else {
          await palestranteService.criar(this.form)
        }
        this.resetarForm()
        await this.carregarPalestrantes()
      } catch (error) {
        this.erroForm = error.message || 'Erro ao salvar palestrante.'
      } finally {
        this.salvando = false
      }
    },
    editar(palestrante) {
      this.editandoId = palestrante._id
      this.form = {
        nome: palestrante.nome,
        email: palestrante.email,
        biografia: palestrante.biografia || '',
        areaAtuacao: palestrante.areaAtuacao || '',
        instituicao: palestrante.instituicao || '',
        fotoUrl: palestrante.fotoUrl || ''
      }
    },
    pedirExclusao(palestrante) {
      this.palestranteParaExcluir = palestrante
    },
    async confirmarExclusao() {
      const palestrante = this.palestranteParaExcluir
      if (!palestrante) return

      try {
        await palestranteService.excluir(palestrante._id)
        this.palestranteParaExcluir = null
        await this.carregarPalestrantes()
      } catch (error) {
        this.erroLista = error.message || 'Erro ao excluir palestrante.'
      }
    },
    resetarForm() {
      this.form = formInicial()
      this.editandoId = null
    }
  }
}
</script>
