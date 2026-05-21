<template>
  <div class="form-wrapper auth-form-wrapper">
    <div class="form-card">
      <div class="form-header">
        <h2>Criar Conta</h2>
        <p>Junte-se ao UniEvent para participar dos eventos</p>
      </div>

      <div v-if="erro" class="estado-erro form-erro">{{ erro }}</div>
      <div v-if="sucesso" class="estado-sucesso">{{ sucesso }}</div>

      <form @submit.prevent="cadastrar">
        <div class="form-group">
          <label>Nome completo</label>
          <input v-model="form.nome" type="text" placeholder="Seu nome completo" required />
        </div>
        <div class="form-group">
          <label>E-mail</label>
          <input v-model="form.email" type="email" placeholder="seu@email.com" required />
        </div>

        <div class="form-grid auth-form-grid">
          <div class="form-group">
            <label>Senha</label>
            <input v-model="form.senha" type="password" placeholder="Minimo 6 caracteres" required />
          </div>
          <div class="form-group">
            <label>Confirmar senha</label>
            <input v-model="form.confirmarSenha" type="password" placeholder="Repita a senha" required />
          </div>
        </div>

        <div class="form-grid auth-form-grid">
          <div class="form-group">
            <label>Curso</label>
            <input v-model="form.curso" type="text" placeholder="Ex: Ciencia da Computacao" />
          </div>
          <div class="form-group">
            <label>RA</label>
            <input v-model="form.ra" type="text" placeholder="Registro Academico" />
          </div>
        </div>

        <button type="submit" :disabled="carregando" class="btn-submit">
          {{ carregando ? 'Cadastrando...' : 'Criar conta' }}
        </button>
      </form>

      <p class="form-rodape">
        Ja tem conta?
        <router-link to="/login">Entrar</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { authService } from '@/services/authService'

export default {
  name: 'CadastroView',
  data() {
    return {
      form: { nome: '', email: '', senha: '', confirmarSenha: '', curso: '', ra: '' },
      carregando: false,
      erro: null,
      sucesso: null
    }
  },
  methods: {
    async cadastrar() {
      this.erro = null
      this.sucesso = null

      if (this.form.senha !== this.form.confirmarSenha) {
        this.erro = 'As senhas nao coincidem.'
        return
      }

      this.carregando = true

      try {
        const payload = {
          nome: this.form.nome,
          email: this.form.email,
          senha: this.form.senha,
          curso: this.form.curso,
          ra: this.form.ra
        }
        await authService.register(payload)
        this.sucesso = 'Conta criada com sucesso! Redirecionando para o login...'
        setTimeout(() => this.$router.push('/login'), 1500)
      } catch (error) {
        this.erro = error.message || 'Erro ao criar conta.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
