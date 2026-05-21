<template>
  <div class="form-wrapper">
    <div class="form-card">
      <div class="form-header">
        <h2>Redefinir Senha</h2>
        <p>Crie uma nova senha de acesso</p>
      </div>

      <div v-if="erro" class="estado-erro form-erro">{{ erro }}</div>
      <div v-if="sucesso" class="estado-sucesso">{{ sucesso }}</div>

      <form @submit.prevent="redefinir">
        <div class="form-group">
          <label>Token</label>
          <input v-model="form.token" type="text" required />
        </div>
        <div class="form-group">
          <label>Nova senha</label>
          <input v-model="form.novaSenha" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div class="form-group">
          <label>Confirmar nova senha</label>
          <input v-model="confirmarSenha" type="password" placeholder="Repita a senha" required />
        </div>
        <button type="submit" :disabled="carregando" class="btn-submit">
          {{ carregando ? 'Salvando...' : 'Redefinir senha' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { authService } from '@/services/authService'

export default {
  name: 'RedefinirSenhaView',
  data() {
    return {
      form: {
        token: this.$route.query.token || '',
        novaSenha: ''
      },
      confirmarSenha: '',
      carregando: false,
      erro: null,
      sucesso: null
    }
  },
  methods: {
    async redefinir() {
      this.erro = null
      this.sucesso = null

      if (this.form.novaSenha !== this.confirmarSenha) {
        this.erro = 'As senhas não coincidem.'
        return
      }

      this.carregando = true

      try {
        await authService.resetPassword(this.form.token, this.form.novaSenha)
        this.sucesso = 'Senha redefinida com sucesso. Redirecionando para o login...'
        setTimeout(() => this.$router.push('/login'), 1500)
      } catch (error) {
        this.erro = error.message || 'Erro ao redefinir senha.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
