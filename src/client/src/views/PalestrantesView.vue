<template>
  <div>
    <div class="page-header page-header-acoes">
      <div class="page-header-titulo">
        <div class="linha-titulo-role">
          <h1>Palestrantes</h1>
          <span v-if="podeGerenciar" class="role-pill">Modo gestor</span>
        </div>
        <p v-if="podeGerenciar" class="page-subtitle">
          Cadastre e edite palestrantes sem sair da listagem.
        </p>
      </div>
      <button v-if="podeGerenciar" type="button" class="btn-submit btn-header" @click="abrirCadastro">
        Cadastrar palestrante
      </button>
    </div>

    <section v-if="mostrandoForm" class="painel-card crud-form-card">
      <h2>{{ editandoId ? 'Editar palestrante' : 'Cadastrar palestrante' }}</h2>
      <div v-if="erroForm" class="estado-erro form-erro">{{ erroForm }}</div>
      <div v-if="sucesso" class="estado-sucesso">{{ sucesso }}</div>

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
            <label>Area de atuacao</label>
            <input v-model="form.areaAtuacao" type="text" />
          </div>
          <div class="form-group">
            <label>Instituicao</label>
            <input v-model="form.instituicao" type="text" />
          </div>
        </div>
        <div class="form-group">
          <label>Foto URL</label>
          <input
            v-model="form.fotoUrl"
            type="url"
            placeholder="https://exemplo.com/foto.jpg"
            @input="previewFotoComErro = false"
          />
          <div v-if="form.fotoUrl" class="foto-url-preview">
            <img
              v-if="!previewFotoComErro"
              :src="form.fotoUrl"
              alt="Previa da foto do palestrante"
              @error="previewFotoComErro = true"
            />
            <div v-else class="foto-url-preview-erro">
              Nao foi possivel carregar esta imagem.
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Biografia</label>
          <textarea v-model="form.biografia" rows="4"></textarea>
        </div>

        <div class="card-acoes card-acoes-linha">
          <button type="submit" :disabled="salvando" class="btn-submit">
            {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
          </button>
          <button type="button" class="btn-secundario" @click="fecharForm">Cancelar</button>
        </div>
      </form>
    </section>

    <div v-if="carregando" class="estado-loading">Carregando palestrantes...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
    <div v-else-if="palestrantes.length === 0" class="estado-vazio">
      Nenhum palestrante cadastrado no momento.
    </div>

    <div v-else class="eventos-container">
      <article v-for="p in palestrantes" :key="p._id" class="evento-card palestrante-card">
        <div v-if="p.fotoUrl && !imagensComErro[p._id]" class="evento-card-image palestrante-foto">
          <img :src="p.fotoUrl" :alt="`Foto de ${p.nome}`" loading="lazy" @error="marcarImagemComErro(p._id)" />
        </div>
        <div v-else class="evento-card-image palestrante-foto palestrante-foto-fallback">Palestrante</div>
        <div class="evento-card-body">
          <h3>{{ p.nome }}</h3>
          <div class="evento-info">
            <span class="icone">E-mail</span>
            <span>{{ p.email }}</span>
          </div>
          <div v-if="p.areaAtuacao" class="evento-info">
            <span class="icone">Area</span>
            <span>{{ p.areaAtuacao }}</span>
          </div>
          <div v-if="p.instituicao" class="evento-info">
            <span class="icone">Inst.</span>
            <span>{{ p.instituicao }}</span>
          </div>
          <p v-if="p.biografia" class="palestrante-bio">{{ p.biografia }}</p>

          <div v-if="podeGerenciar" class="card-acoes">
            <button type="button" class="btn-mini" @click="editar(p)">Editar</button>
            <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(p)">Excluir</button>
          </div>
        </div>
      </article>
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
import { authStorage } from '@/services/api'
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
  name: 'PalestrantesView',
  components: {
    ConfirmModal
  },
  data() {
    return {
      palestrantes: [],
      form: formInicial(),
      editandoId: null,
      mostrandoForm: false,
      carregando: true,
      salvando: false,
      erro: null,
      erroForm: null,
      sucesso: null,
      imagensComErro: {},
      previewFotoComErro: false,
      palestranteParaExcluir: null
    }
  },
  async created() {
    await this.carregarPalestrantes()
  },
  computed: {
    podeGerenciar() {
      const usuario = authStorage.getUser()
      return ['admin', 'organizador'].includes(usuario?.tipoPerfil)
    },
    mensagemExclusao() {
      const nome = this.palestranteParaExcluir?.nome || 'este palestrante'
      return `Tem certeza que deseja excluir "${nome}"? Essa acao nao pode ser desfeita.`
    }
  },
  methods: {
    async carregarPalestrantes() {
      this.carregando = true
      this.erro = null

      try {
        this.palestrantes = await palestranteService.listar()
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar palestrantes.'
      } finally {
        this.carregando = false
      }
    },
    abrirCadastro() {
      this.resetarForm()
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
      this.previewFotoComErro = false
    },
    async salvar() {
      this.salvando = true
      this.erroForm = null
      this.sucesso = null

      try {
        if (this.editandoId) {
          await palestranteService.atualizar(this.editandoId, this.form)
          this.sucesso = 'Palestrante atualizado com sucesso.'
        } else {
          await palestranteService.criar(this.form)
          this.sucesso = 'Palestrante cadastrado com sucesso.'
        }
        this.resetarForm()
        this.mostrandoForm = false
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
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
      this.previewFotoComErro = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    pedirExclusao(palestrante) {
      this.palestranteParaExcluir = palestrante
    },
    async confirmarExclusao() {
      const palestrante = this.palestranteParaExcluir
      if (!palestrante) return

      try {
        await palestranteService.excluir(palestrante._id)
        if (this.editandoId === palestrante._id) {
          this.fecharForm()
        }
        this.palestranteParaExcluir = null
        await this.carregarPalestrantes()
      } catch (error) {
        this.erro = error.message || 'Erro ao excluir palestrante.'
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
      this.previewFotoComErro = false
    },
    marcarImagemComErro(id) {
      this.imagensComErro[id] = true
    }
  }
}
</script>
