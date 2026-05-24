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
            <label>Titulacao</label>
            <select v-model="form.titulacao">
              <option value="">Nao informada</option>
              <option v-for="t in titulacoes" :key="t.valor" :value="t.valor">{{ t.rotulo }}</option>
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Universidade vinculada</label>
            <select v-model="form.universidadeId">
              <option value="">Nao vinculada</option>
              <option v-for="u in universidades" :key="u._id" :value="u._id">{{ u.sigla }} - {{ u.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Instituicao (texto livre)</label>
            <input v-model="form.instituicao" type="text" placeholder="Use se nao usar uma das universidades cadastradas" />
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Lattes</label>
            <input v-model="form.lattes" type="url" placeholder="http://lattes.cnpq.br/..." />
          </div>
          <div class="form-group">
            <label>LinkedIn</label>
            <input v-model="form.linkedin" type="url" placeholder="https://linkedin.com/in/..." />
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
          <div v-if="p.titulacao" class="evento-info">
            <span class="icone">Titulo</span>
            <span>{{ rotuloTitulacao(p.titulacao) }}</span>
          </div>
          <div v-if="rotuloUniversidade(p) || p.instituicao" class="evento-info">
            <span class="icone">Inst.</span>
            <span>{{ rotuloUniversidade(p) || p.instituicao }}</span>
          </div>
          <div v-if="p.lattes || p.linkedin" class="evento-info evento-info-links">
            <a v-if="p.lattes" :href="p.lattes" target="_blank" rel="noopener" class="link-mini">Lattes</a>
            <a v-if="p.linkedin" :href="p.linkedin" target="_blank" rel="noopener" class="link-mini">LinkedIn</a>
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
import { palestranteService, titulacoesPermitidas } from '@/services/palestranteService'
import { universidadeService } from '@/services/universidadeService'
import { toastService } from '@/services/toastService'

const idDe = (ref) => (ref && typeof ref === 'object' ? ref._id : ref)

const formInicial = () => ({
  nome: '',
  email: '',
  biografia: '',
  areaAtuacao: '',
  instituicao: '',
  fotoUrl: '',
  universidadeId: '',
  titulacao: '',
  lattes: '',
  linkedin: ''
})

export default {
  name: 'PalestrantesView',
  components: {
    ConfirmModal
  },
  data() {
    return {
      palestrantes: [],
      universidades: [],
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
    await Promise.all([this.carregarPalestrantes(), this.carregarUniversidades()])
  },
  computed: {
    podeGerenciar() {
      const usuario = authStorage.getUser()
      return ['admin', 'organizador'].includes(usuario?.tipoPerfil)
    },
    mensagemExclusao() {
      const nome = this.palestranteParaExcluir?.nome || 'este palestrante'
      return `Tem certeza que deseja excluir "${nome}"? Essa acao nao pode ser desfeita.`
    },
    titulacoes() {
      return titulacoesPermitidas
    }
  },
  methods: {
    rotuloTitulacao(valor) {
      return titulacoesPermitidas.find((t) => t.valor === valor)?.rotulo || valor
    },
    rotuloUniversidade(palestrante) {
      const ref = palestrante.universidadeId
      if (!ref) return ''
      if (typeof ref === 'object') {
        return ref.sigla ? `${ref.sigla} - ${ref.nome}` : ref.nome
      }
      const u = this.universidades.find((x) => x._id === ref)
      return u ? `${u.sigla} - ${u.nome}` : ''
    },
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
    async carregarUniversidades() {
      try {
        this.universidades = await universidadeService.listar()
      } catch (error) {
        this.universidades = []
      }
    },
    abrirCadastro() {
      this.resetarForm()
      this.mostrandoForm = true
      this.erroForm = null
      this.sucesso = null
      this.previewFotoComErro = false
    },
    payloadPalestrante() {
      return {
        nome: this.form.nome,
        email: this.form.email,
        biografia: this.form.biografia || null,
        areaAtuacao: this.form.areaAtuacao || null,
        instituicao: this.form.instituicao || null,
        fotoUrl: this.form.fotoUrl || null,
        universidadeId: this.form.universidadeId || null,
        titulacao: this.form.titulacao || null,
        lattes: this.form.lattes || null,
        linkedin: this.form.linkedin || null
      }
    },
    async salvar() {
      this.salvando = true
      this.erroForm = null

      try {
        if (this.editandoId) {
          await palestranteService.atualizar(this.editandoId, this.payloadPalestrante())
          toastService.success('Palestrante atualizado com sucesso.')
        } else {
          await palestranteService.criar(this.payloadPalestrante())
          toastService.success('Palestrante cadastrado com sucesso.')
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
        fotoUrl: palestrante.fotoUrl || '',
        universidadeId: idDe(palestrante.universidadeId) || '',
        titulacao: palestrante.titulacao || '',
        lattes: palestrante.lattes || '',
        linkedin: palestrante.linkedin || ''
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
        toastService.success('Palestrante excluido com sucesso.')
        await this.carregarPalestrantes()
      } catch (error) {
        toastService.error(error.message || 'Erro ao excluir palestrante.')
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
