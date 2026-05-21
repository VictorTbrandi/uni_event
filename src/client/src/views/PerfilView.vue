<template>
  <div>
    <div class="page-header">
      <h1>Perfil</h1>
    </div>

    <div v-if="carregando" class="estado-loading">Carregando perfil...</div>
    <div v-else-if="usuario" class="form-wrapper">
      <div class="form-card">
        <div v-if="erro" class="estado-erro form-erro">{{ erro }}</div>
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
          <div class="form-group">
            <label>Perfil</label>
            <input :value="formatarPerfil(usuario.tipoPerfil)" type="text" disabled />
          </div>
          <div class="form-group">
            <label>Curso</label>
            <input v-model="form.curso" type="text" />
          </div>
          <div class="form-group">
            <label>RA</label>
            <input v-model="form.ra" type="text" />
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
import { formatarPerfil } from '@/utils/formatters'

export default {
  name: 'PerfilView',
  data() {
    return {
      usuario: null,
      form: { nome: '', email: '', curso: '', ra: '' },
      carregando: true,
      salvando: false,
      erro: null,
      sucesso: null
    }
  },
  async created() {
    await this.carregarPerfil()
  },
  methods: {
    formatarPerfil,
    async carregarPerfil() {
      try {
        this.usuario = await authService.me()
        this.form = {
          nome: this.usuario.nome || '',
          email: this.usuario.email || '',
          curso: this.usuario.curso || '',
          ra: this.usuario.ra || ''
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
      this.sucesso = null

      try {
        this.usuario = await authService.updateProfile(this.usuario._id, this.form)
        this.sucesso = 'Perfil atualizado com sucesso.'
      } catch (error) {
        this.erro = error.message || 'Erro ao atualizar perfil.'
      } finally {
        this.salvando = false
      }
    }
  }
}
</script>
