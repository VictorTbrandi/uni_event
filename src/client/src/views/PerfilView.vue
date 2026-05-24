<template>
  <div>
    <div class="page-header">
      <h1>Perfil</h1>
    </div>

    <div v-if="carregando" class="estado-loading">Carregando perfil...</div>
    <div v-else-if="usuario" class="form-wrapper">
      <div class="form-card">
        <div v-if="erro" class="estado-erro form-erro">{{ erro }}</div>

        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.nome" type="text" required />
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Perfil</label>
            <input :value="formatarPerfil(usuario.tipoPerfil)" type="text" disabled />
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
              <label>Curso</label>
              <select v-model="form.cursoId" :disabled="!form.universidadeId">
                <option value="">Nenhum</option>
                <option v-for="c in cursosFiltrados" :key="c._id" :value="c._id">{{ c.nome }}</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Curso (texto livre)</label>
              <input v-model="form.curso" type="text" placeholder="Use se sua opcao nao estiver na lista" />
            </div>
            <div class="form-group">
              <label>RA / Matricula</label>
              <input v-model="form.ra" type="text" />
            </div>
          </div>

          <button type="submit" :disabled="salvando" class="btn-submit">
            {{ salvando ? 'Salvando...' : 'Salvar perfil' }}
          </button>
        </form>
      </div>
    </div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
  </div>
</template>

<script>
import { authService } from '@/services/authService'
import { universidadeService } from '@/services/universidadeService'
import { cursoService } from '@/services/cursoService'
import { toastService } from '@/services/toastService'
import { formatarPerfil } from '@/utils/formatters'

const idDe = (ref) => (ref && typeof ref === 'object' ? ref._id : ref)

export default {
  name: 'PerfilView',
  data() {
    return {
      usuario: null,
      universidades: [],
      cursos: [],
      form: {
        nome: '',
        email: '',
        curso: '',
        universidadeId: '',
        cursoId: '',
        ra: ''
      },
      carregando: true,
      salvando: false,
      erro: null,
      sucesso: null
    }
  },
  computed: {
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
    async carregarTudo() {
      try {
        const [usuario, universidades, cursos] = await Promise.all([
          authService.me(),
          universidadeService.listar(),
          cursoService.listar()
        ])
        this.usuario = usuario
        this.universidades = universidades
        this.cursos = cursos
        this.form = {
          nome: usuario.nome || '',
          email: usuario.email || '',
          curso: usuario.curso || '',
          universidadeId: idDe(usuario.universidadeId) || '',
          cursoId: idDe(usuario.cursoId) || '',
          ra: usuario.ra || ''
        }
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar perfil.'
      } finally {
        this.carregando = false
      }
    },
    async salvar() {
      this.salvando = true
      this.erro = null

      try {
        const payload = {
          nome: this.form.nome,
          email: this.form.email,
          curso: this.form.curso || null,
          universidadeId: this.form.universidadeId || null,
          cursoId: this.form.cursoId || null,
          ra: this.form.ra || null
        }
        this.usuario = await authService.updateProfile(this.usuario._id, payload)
        toastService.success('Perfil atualizado com sucesso.')
      } catch (error) {
        toastService.error(error.message || 'Erro ao atualizar perfil.')
        this.erro = error.message || 'Erro ao atualizar perfil.'
      } finally {
        this.salvando = false
      }
    }
  }
}
</script>
