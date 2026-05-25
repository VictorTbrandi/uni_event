<template>
  <div>
    <div class="page-header">
      <h1>Usuários</h1>
    </div>

    <div class="painel-layout">
      <section class="painel-card">
        <h2>{{ editandoId ? 'Editar usuário' : 'Novo usuário' }}</h2>
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
          <div v-if="!editandoId" class="form-group">
            <label>Senha</label>
            <input v-model="form.senha" type="password" placeholder="Mínimo 6 caracteres" required />
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Perfil</label>
              <select v-model="form.tipoPerfil" required>
                <option value="participante">Participante</option>
                <option value="organizador">Organizador</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.ativo">
                <option :value="true">Ativo</option>
                <option :value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Universidade</label>
              <select v-model="form.universidadeId">
                <option value="">Nao vinculado</option>
                <option v-for="u in universidades" :key="u._id" :value="u._id">{{ u.sigla }} - {{ u.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Curso vinculado</label>
              <select v-model="form.cursoId" :disabled="!form.universidadeId">
                <option value="">Nenhum</option>
                <option v-for="c in cursosFiltrados" :key="c._id" :value="c._id">{{ c.nome }}</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Curso (texto livre)</label>
              <input v-model="form.curso" type="text" />
            </div>
            <div class="form-group">
              <label>RA</label>
              <input v-model="form.ra" type="text" />
            </div>
          </div>

          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvando" class="btn-submit">
              {{ salvando ? 'Salvando...' : 'Salvar usuário' }}
            </button>
            <button v-if="editandoId" type="button" class="btn-secundario" @click="resetarForm">Cancelar edição</button>
          </div>
        </form>
      </section>

      <section class="painel-card painel-card-lista">
        <h2>Usuários</h2>
        <div v-if="carregando" class="estado-loading">Carregando usuários...</div>
        <div v-else-if="erroLista" class="estado-erro">{{ erroLista }}</div>
        <div v-else class="tabela-responsiva">
          <table class="tabela-com-icones">
            <thead>
              <tr>
                <th><span class="th-conteudo"><IconUser :size="14" stroke-width="1.75" aria-hidden="true" />Nome</span></th>
                <th><span class="th-conteudo"><IconMail :size="14" stroke-width="1.75" aria-hidden="true" />E-mail</span></th>
                <th><span class="th-conteudo"><IconUserShield :size="14" stroke-width="1.75" aria-hidden="true" />Perfil</span></th>
                <th><span class="th-conteudo"><IconBuildingCommunity :size="14" stroke-width="1.75" aria-hidden="true" />Universidade</span></th>
                <th><span class="th-conteudo"><IconBook :size="14" stroke-width="1.75" aria-hidden="true" />Curso</span></th>
                <th><span class="th-conteudo"><IconCircleDot :size="14" stroke-width="1.75" aria-hidden="true" />Status</span></th>
                <th><span class="th-conteudo"><IconSettings :size="14" stroke-width="1.75" aria-hidden="true" />Ações</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuarios" :key="usuario._id">
                <td>{{ usuario.nome }}</td>
                <td>{{ usuario.email }}</td>
                <td>{{ formatarPerfil(usuario.tipoPerfil) }}</td>
                <td>{{ siglaUniversidade(usuario) || '-' }}</td>
                <td>{{ nomeCurso(usuario) || '-' }}</td>
                <td>
                  <span :class="['status-dot', usuario.ativo ? 'status-dot-ativo' : 'status-dot-inativo']" aria-hidden="true"></span>
                  {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
                </td>
                <td class="acoes-tabela">
                  <button type="button" class="btn-mini" @click="editar(usuario)">
                    <IconPencil :size="14" stroke-width="1.75" aria-hidden="true" />
                    Editar
                  </button>
                  <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(usuario)">
                    <IconTrash :size="14" stroke-width="1.75" aria-hidden="true" />
                    Excluir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <ConfirmModal
      :aberto="Boolean(usuarioParaExcluir)"
      titulo="Excluir usuario"
      :mensagem="mensagemExclusao"
      texto-confirmar="Excluir"
      @cancelar="usuarioParaExcluir = null"
      @confirmar="confirmarExclusao"
    />
  </div>
</template>

<script>
import {
  IconUser,
  IconMail,
  IconUserShield,
  IconBuildingCommunity,
  IconBook,
  IconCircleDot,
  IconSettings,
  IconPencil,
  IconTrash
} from '@tabler/icons-vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { userService } from '@/services/userService'
import { universidadeService } from '@/services/universidadeService'
import { cursoService } from '@/services/cursoService'
import { toastService } from '@/services/toastService'
import { formatarPerfil } from '@/utils/formatters'

const idDe = (ref) => (ref && typeof ref === 'object' ? ref._id : ref)

const formInicial = () => ({
  nome: '',
  email: '',
  senha: '',
  tipoPerfil: 'participante',
  curso: '',
  universidadeId: '',
  cursoId: '',
  ra: '',
  ativo: true
})

export default {
  name: 'AdminUsuariosView',
  components: {
    ConfirmModal,
    IconUser,
    IconMail,
    IconUserShield,
    IconBuildingCommunity,
    IconBook,
    IconCircleDot,
    IconSettings,
    IconPencil,
    IconTrash
  },
  data() {
    return {
      usuarios: [],
      universidades: [],
      cursos: [],
      form: formInicial(),
      editandoId: null,
      carregando: true,
      salvando: false,
      erroLista: null,
      erroForm: null,
      usuarioParaExcluir: null
    }
  },
  computed: {
    mensagemExclusao() {
      const nome = this.usuarioParaExcluir?.nome || 'este usuario'
      return `Tem certeza que deseja excluir "${nome}"? Essa acao nao pode ser desfeita.`
    },
    cursosFiltrados() {
      if (!this.form.universidadeId) return []
      return this.cursos.filter((c) => idDe(c.universidadeId) === this.form.universidadeId)
    }
  },
  watch: {
    'form.universidadeId'(novoValor, valorAnterior) {
      if (novoValor !== valorAnterior) {
        const cursoOk = this.cursos.some(
          (c) => c._id === this.form.cursoId && idDe(c.universidadeId) === novoValor
        )
        if (!cursoOk) this.form.cursoId = ''
      }
    }
  },
  async created() {
    await this.carregarTudo()
  },
  methods: {
    formatarPerfil,
    siglaUniversidade(usuario) {
      const ref = usuario.universidadeId
      if (!ref) return ''
      if (typeof ref === 'object') return ref.sigla || ref.nome
      const u = this.universidades.find((x) => x._id === ref)
      return u ? u.sigla : ''
    },
    nomeCurso(usuario) {
      const ref = usuario.cursoId
      if (ref) {
        if (typeof ref === 'object') return ref.nome
        const c = this.cursos.find((x) => x._id === ref)
        if (c) return c.nome
      }
      return usuario.curso || ''
    },
    async carregarTudo() {
      this.carregando = true
      try {
        const [usuarios, universidades, cursos] = await Promise.all([
          userService.listar(),
          universidadeService.listar(),
          cursoService.listar()
        ])
        this.usuarios = usuarios
        this.universidades = universidades
        this.cursos = cursos
      } catch (error) {
        this.erroLista = error.message || 'Erro ao carregar usuários.'
      } finally {
        this.carregando = false
      }
    },
    async salvar() {
      this.salvando = true
      this.erroForm = null

      try {
        const baseInstitucional = {
          curso: this.form.curso || null,
          universidadeId: this.form.universidadeId || null,
          cursoId: this.form.cursoId || null,
          ra: this.form.ra || null
        }

        if (this.editandoId) {
          const payload = {
            nome: this.form.nome,
            email: this.form.email,
            tipoPerfil: this.form.tipoPerfil,
            ativo: this.form.ativo,
            ...baseInstitucional
          }
          await userService.atualizar(this.editandoId, payload)
          toastService.success('Usuario atualizado com sucesso.')
        } else {
          await userService.criar({
            nome: this.form.nome,
            email: this.form.email,
            senha: this.form.senha,
            tipoPerfil: this.form.tipoPerfil,
            ativo: this.form.ativo,
            ...baseInstitucional
          })
          toastService.success('Usuario cadastrado com sucesso.')
        }
        this.resetarForm()
        await this.carregarTudo()
      } catch (error) {
        this.erroForm = error.message || 'Erro ao salvar usuário.'
      } finally {
        this.salvando = false
      }
    },
    editar(usuario) {
      this.editandoId = usuario._id
      this.form = {
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        tipoPerfil: usuario.tipoPerfil,
        curso: usuario.curso || '',
        universidadeId: idDe(usuario.universidadeId) || '',
        cursoId: idDe(usuario.cursoId) || '',
        ra: usuario.ra || '',
        ativo: usuario.ativo
      }
    },
    pedirExclusao(usuario) {
      this.usuarioParaExcluir = usuario
    },
    async confirmarExclusao() {
      const usuario = this.usuarioParaExcluir
      if (!usuario) return

      try {
        await userService.excluir(usuario._id)
        this.usuarioParaExcluir = null
        toastService.success('Usuario excluido com sucesso.')
        await this.carregarTudo()
      } catch (error) {
        toastService.error(error.message || 'Erro ao excluir usuário.')
      }
    },
    resetarForm() {
      this.form = formInicial()
      this.editandoId = null
    }
  }
}
</script>
