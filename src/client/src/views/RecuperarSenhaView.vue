<template>
  <div class="form-wrapper">
    <div class="form-card">
      <div class="form-header">
        <h2>Recuperar Senha</h2>
        <p>Informe o e-mail cadastrado</p>
      </div>

      <div v-if="erro" class="estado-erro form-erro">{{ erro }}</div>
      <div v-if="sucesso" class="estado-sucesso">{{ sucesso }}</div>

      <form @submit.prevent="recuperar">
        <div class="form-group">
          <label>E-mail</label>
          <input v-model="email" type="email" placeholder="seu@email.com" required />
        </div>
        <button type="submit" :disabled="carregando" class="btn-submit">
          {{ carregando ? 'Enviando...' : 'Gerar token' }}
        </button>
      </form>

      <div v-if="resetToken" class="token-box">
        <strong>Token:</strong>
        <code>{{ resetToken }}</code>
        <router-link :to="{ name: 'redefinir-senha', query: { token: resetToken } }">Redefinir senha</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from '@/services/authService'

export default {
  name: 'RecuperarSenhaView',
  data() {
    return {
      email: '',
      resetToken: '',
      carregando: false,
      erro: null,
      sucesso: null
    }
  },
  methods: {
    async recuperar() {
      this.carregando = true
      this.erro = null
      this.sucesso = null
      this.resetToken = ''

      try {
        const data = await authService.forgotPassword(this.email)
        this.resetToken = data.resetToken
        this.sucesso = 'Token gerado com sucesso.'
      } catch (error) {
        this.erro = error.message || 'Erro ao gerar token de redefinição.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
