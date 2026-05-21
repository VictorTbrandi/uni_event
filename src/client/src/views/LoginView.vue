<template>
  <div class="form-wrapper auth-form-wrapper">
    <div class="form-card form-card-login">
      <div class="form-header">
        <h2>Entrar</h2>
        <p>Acesse sua conta no UniEvent</p>
      </div>

      <div v-if="erro" class="estado-erro form-erro">{{ erro }}</div>

      <form @submit.prevent="login">
        <div class="form-group">
          <label>E-mail</label>
          <input v-model="form.email" type="email" placeholder="seu@email.com" required />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input v-model="form.senha" type="password" placeholder="Sua senha" required />
        </div>
        <button type="submit" :disabled="carregando" class="btn-submit">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="form-rodape">
        <router-link to="/recuperar-senha">Esqueci minha senha</router-link>
        <span class="form-rodape-separador"></span>
        Nao tem conta?
        <router-link to="/cadastro">Cadastre-se</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { authService } from '@/services/authService'

export default {
  name: 'LoginView',
  data() {
    return {
      form: { email: '', senha: '' },
      carregando: false,
      erro: null
    }
  },
  methods: {
    async login() {
      this.erro = null
      this.carregando = true

      try {
        await authService.login(this.form)
        this.$router.push(this.$route.query.redirect || '/')
      } catch (error) {
        this.erro = error.message || 'Credenciais invalidas.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
