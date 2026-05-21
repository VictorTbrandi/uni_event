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
              <label>Curso</label>
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
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuarios" :key="usuario._id">
                <td>{{ usuario.nome }}</td>
                <td>{{ usuario.email }}</td>
                <td>{{ formatarPerfil(usuario.tipoPerfil) }}</td>
                <td>{{ usuario.ativo ? 'Ativo' : 'Inativo' }}</td>
                <td class="acoes-tabela">
                  <button type="button" class="btn-mini" @click="editar(usuario)">Editar</button>
                  <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusao(usuario)">Excluir</button>
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
import ConfirmModal from '@/components/ConfirmModal.vue'
import { userService } from '@/services/userService'
import { formatarPerfil } from '@/utils/formatters'

const formInicial = () => ({
  nome: '',
  email: '',
  senha: '',
  tipoPerfil: 'participante',
  curso: '',
  ra: '',
  ativo: true
})

export default {
  name: 'AdminUsuariosView',
  components: {
    ConfirmModal
  },
  data() {
    return {
      usuarios: [],
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
    }
  },
  async created() {
    await this.carregarUsuarios()
  },
  methods: {
    formatarPerfil,
    async carregarUsuarios() {
      try {
        this.usuarios = await userService.listar()
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
        if (this.editandoId) {
          const payload = {
            nome: this.form.nome,
            email: this.form.email,
            tipoPerfil: this.form.tipoPerfil,
            curso: this.form.curso,
            ra: this.form.ra,
            ativo: this.form.ativo
          }
          await userService.atualizar(this.editandoId, payload)
        } else {
          await userService.criar(this.form)
        }
        this.resetarForm()
        await this.carregarUsuarios()
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
        await this.carregarUsuarios()
      } catch (error) {
        this.erroLista = error.message || 'Erro ao excluir usuário.'
      }
    },
    resetarForm() {
      this.form = formInicial()
      this.editandoId = null
    }
  }
}
</script>
