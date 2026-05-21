<template>
  <div>
    <div class="page-header page-header-acoes">
      <h1>Categorias</h1>
      <button v-if="podeGerenciar" type="button" class="btn-submit btn-header" @click="abrirCadastro">
        Cadastrar categoria
      </button>
    </div>

    <section v-if="mostrandoForm" class="painel-card crud-form-card">
      <h2>{{ editandoId ? 'Editar categoria' : 'Cadastrar categoria' }}</h2>
      <div v-if="erroForm" class="estado-erro form-erro">{{ erroForm }}</div>
      <div v-if="sucesso" class="estado-sucesso">{{ sucesso }}</div>

      <form @submit.prevent="salvar">
        <div class="form-group">
          <label>Nome</label>
          <input v-model="form.nome" type="text" required />
        </div>
        <div class="form-group">
          <label>Descricao</label>
          <textarea v-model="form.descricao" rows="4"></textarea>
        </div>
        <div class="card-acoes card-acoes-linha">
          <button type="submit" :disabled="salvando" class="btn-submit">
            {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
          </button>
          <button type="button" class="btn-secundario" @click="fecharForm">Cancelar</button>
        </div>
      </form>
    </section>

    <div v-if="carregando" class="estado-loading">Carregando categorias...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
    <div v-else-if="categorias.length === 0" class="estado-vazio">
      Nenhuma categoria cadastrada no momento.
    </div>

    <div v-else class="categorias-container">
      <article v-for="c in categorias" :key="c._id" class="categoria-card">
        <div class="categoria-icone">Categoria</div>
        <h3>{{ c.nome }}</h3>
        <p v-if="c.descricao">{{ c.descricao }}</p>
        <p v-else class="sem-descricao">Sem descricao disponivel.</p>

        <div class="card-acoes categoria-acoes">
          <button type="button" class="btn-mini" @click="filtrarCategoria(c._id)">Ver eventos</button>
          <button v-if="podeGerenciar" type="button" class="btn-mini" @click="editar(c)">Editar</button>
          <button v-if="podeGerenciar" type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(c)">Excluir</button>
        </div>
      </article>
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
import { authStorage } from '@/services/api'
import { categoriaService } from '@/services/categoriaService'

const formInicial = () => ({ nome: '', descricao: '' })

export default {
  name: 'CategoriasView',
  components: {
    ConfirmModal
  },
  data() {
    return {
      categorias: [],
      form: formInicial(),
      editandoId: null,
      mostrandoForm: false,
      carregando: true,
      salvando: false,
      erro: null,
      erroForm: null,
      sucesso: null,
      categoriaParaExcluir: null
    }
  },
  async created() {
    await this.carregarCategorias()
  },
  computed: {
    podeGerenciar() {
      const usuario = authStorage.getUser()
      return ['admin', 'organizador'].includes(usuario?.tipoPerfil)
    },
    mensagemExclusao() {
      const nome = this.categoriaParaExcluir?.nome || 'esta categoria'
      return `Tem certeza que deseja excluir "${nome}"? Essa acao nao pode ser desfeita.`
    }
  },
  methods: {
    async carregarCategorias() {
      this.carregando = true
      this.erro = null

      try {
        this.categorias = await categoriaService.listar()
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar categorias.'
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
    async salvar() {
      this.salvando = true
      this.erroForm = null
      this.sucesso = null

      try {
        if (this.editandoId) {
          await categoriaService.atualizar(this.editandoId, this.form)
          this.sucesso = 'Categoria atualizada com sucesso.'
        } else {
          await categoriaService.criar(this.form)
          this.sucesso = 'Categoria cadastrada com sucesso.'
        }
        this.resetarForm()
        this.mostrandoForm = false
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
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    pedirExclusao(categoria) {
      this.categoriaParaExcluir = categoria
    },
    async confirmarExclusao() {
      const categoria = this.categoriaParaExcluir
      if (!categoria) return

      try {
        await categoriaService.excluir(categoria._id)
        if (this.editandoId === categoria._id) {
          this.fecharForm()
        }
        this.categoriaParaExcluir = null
        await this.carregarCategorias()
      } catch (error) {
        this.erro = error.message || 'Erro ao excluir categoria.'
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
    filtrarCategoria(categoriaId) {
      this.$router.push({ name: 'home', query: { categoria: categoriaId } })
    }
  }
}
</script>
