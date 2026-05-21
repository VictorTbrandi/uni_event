<template>
  <div>
    <div class="page-header">
      <h1>Painel de Categorias</h1>
    </div>

    <div class="painel-layout">
      <section class="painel-card">
        <h2>{{ editandoId ? 'Editar categoria' : 'Nova categoria' }}</h2>
        <div v-if="erroForm" class="estado-erro form-erro">{{ erroForm }}</div>
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.nome" type="text" required />
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.descricao" rows="4"></textarea>
          </div>
          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvando" class="btn-submit">
              {{ salvando ? 'Salvando...' : 'Salvar categoria' }}
            </button>
            <button v-if="editandoId" type="button" class="btn-secundario" @click="resetarForm">Cancelar edição</button>
          </div>
        </form>
      </section>

      <section class="painel-card painel-card-lista">
        <h2>Categorias</h2>
        <div v-if="carregando" class="estado-loading">Carregando categorias...</div>
        <div v-else-if="erroLista" class="estado-erro">{{ erroLista }}</div>
        <div v-else class="lista-vertical">
          <article v-for="categoria in categorias" :key="categoria._id" class="item-linha">
            <div>
              <h3>{{ categoria.nome }}</h3>
              <p>{{ categoria.descricao || 'Sem descrição.' }}</p>
            </div>
            <div class="acoes-tabela">
              <button type="button" class="btn-mini" @click="editar(categoria)">Editar</button>
              <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(categoria)">Excluir</button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <ConfirmModal
      :aberto="Boolean(categoriaParaExcluir)"
      titulo="Excluir categoria"
      :mensagem="mensagemExclusao"
      texto-confirmar="Excluir"
      @cancelar="categoriaParaExcluir = null"
      @confirmar="confirmarExclusao"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/ConfirmModal.vue'
import { categoriaService } from '@/services/categoriaService'

const formInicial = () => ({ nome: '', descricao: '' })

export default {
  name: 'PainelCategoriasView',
  components: {
    ConfirmModal
  },
  data() {
    return {
      categorias: [],
      form: formInicial(),
      editandoId: null,
      carregando: true,
      salvando: false,
      erroLista: null,
      erroForm: null,
      categoriaParaExcluir: null
    }
  },
  computed: {
    mensagemExclusao() {
      const nome = this.categoriaParaExcluir?.nome || 'esta categoria'
      return `Tem certeza que deseja excluir "${nome}"? Essa acao nao pode ser desfeita.`
    }
  },
  async created() {
    await this.carregarCategorias()
  },
  methods: {
    async carregarCategorias() {
      try {
        this.categorias = await categoriaService.listar()
      } catch (error) {
        this.erroLista = error.message || 'Erro ao carregar categorias.'
      } finally {
        this.carregando = false
      }
    },
    async salvar() {
      this.salvando = true
      this.erroForm = null

      try {
        if (this.editandoId) {
          await categoriaService.atualizar(this.editandoId, this.form)
        } else {
          await categoriaService.criar(this.form)
        }
        this.resetarForm()
        await this.carregarCategorias()
      } catch (error) {
        this.erroForm = error.message || 'Erro ao salvar categoria.'
      } finally {
        this.salvando = false
      }
    },
    editar(categoria) {
      this.editandoId = categoria._id
      this.form = {
        nome: categoria.nome,
        descricao: categoria.descricao || ''
      }
    },
    pedirExclusao(categoria) {
      this.categoriaParaExcluir = categoria
    },
    async confirmarExclusao() {
      const categoria = this.categoriaParaExcluir
      if (!categoria) return

      try {
        await categoriaService.excluir(categoria._id)
        this.categoriaParaExcluir = null
        await this.carregarCategorias()
      } catch (error) {
        this.erroLista = error.message || 'Erro ao excluir categoria.'
      }
    },
    resetarForm() {
      this.form = formInicial()
      this.editandoId = null
    }
  }
}
</script>
