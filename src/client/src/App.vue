<template>
  <div id="app">

    <!-- Layout de autenticação: sem navbar, mas mantém o wrapper -->
    <template v-if="isAuthPage">
      <div class="auth-page">
        <div class="auth-topbar">
          <router-link to="/" class="auth-brand">Uni<span>Event</span></router-link>
        </div>
        <main>
          <div class="page-content">
            <router-view />
          </div>
        </main>
      </div>
    </template>

    <!-- Layout principal -->
    <template v-else>
      <nav class="navbar">
        <div class="navbar-inner">

          <router-link to="/" class="navbar-brand">Uni<span>Event</span></router-link>

          <!-- Botão do menu + dropdown -->
          <div class="nav-menu-wrapper" @click.stop>
            <button class="nav-menu-btn" aria-label="Menu" @click="toggleMenu">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div class="nav-dropdown" :class="{ 'is-open': menuAberto }">

              <!-- Navegação pública -->
              <span class="nav-secao-label">Navegação</span>
              <router-link to="/" @click="fecharTudo">Eventos</router-link>
              <router-link to="/palestrantes" @click="fecharTudo">Palestrantes</router-link>
              <router-link to="/categorias" @click="fecharTudo">Categorias</router-link>
              <router-link to="/assistente-ia" @click="fecharTudo">Assistente IA</router-link>

              <div class="nav-dropdown-divider"></div>

              <!-- Não logado -->
              <template v-if="!logado">
                <router-link to="/login" @click="fecharTudo">Entrar</router-link>
                <router-link to="/cadastro" class="nav-item-destaque" @click="fecharTudo">Cadastrar</router-link>
              </template>

              <!-- Logado -->
              <template v-else>

                <!-- Identificação -->
                <span class="nav-usuario-info">{{ nomeUsuario }} · {{ labelPerfil }}</span>

                <!-- Painel (organizador / admin) -->
                <template v-if="podePainel">
                  <div class="nav-dropdown-divider"></div>
                  <span class="nav-secao-label">Painel</span>
                  <router-link to="/painel/eventos" @click="fecharTudo">Eventos</router-link>
                  <router-link to="/painel/categorias" @click="fecharTudo">Categorias</router-link>
                  <router-link to="/painel/palestrantes" @click="fecharTudo">Palestrantes</router-link>
                  <router-link v-if="podeAdmin" to="/admin/usuarios" @click="fecharTudo">Usuários</router-link>
                </template>

                <!-- Minha conta -->
                <div class="nav-dropdown-divider"></div>
                <span class="nav-secao-label">Minha conta</span>
                <router-link v-if="podeParticipante" to="/minhas-inscricoes" @click="fecharTudo">Inscrições</router-link>
                <router-link to="/meus-certificados" @click="fecharTudo">Certificados</router-link>
                <router-link to="/perfil" @click="fecharTudo">Perfil</router-link>

                <div class="nav-dropdown-divider"></div>
                <a href="#" class="nav-sair" @click.prevent="sair">Sair</a>

              </template>
            </div>
          </div>

        </div>
      </nav>

      <main>
        <div class="page-content">
          <router-view />
        </div>
      </main>
    </template>

  </div>
</template>

<script>
import { authService } from '@/services/authService'
import { authStorage } from '@/services/api'

const perfilLabels = {
  admin: 'Admin',
  organizador: 'Organizador',
  participante: 'Participante'
}

export default {
  name: 'App',
  data() {
    return {
      logado: authStorage.isAuthenticated(),
      usuario: null,
      menuAberto: false
    }
  },
  computed: {
    isAuthPage() {
      return this.$route.meta?.layout === 'auth'
    },
    nomeUsuario() {
      return this.usuario?.nome || ''
    },
    labelPerfil() {
      return perfilLabels[this.usuario?.tipoPerfil] || ''
    },
    podeParticipante() {
      return ['participante', 'admin'].includes(this.usuario?.tipoPerfil)
    },
    podePainel() {
      return ['organizador', 'admin'].includes(this.usuario?.tipoPerfil)
    },
    podeAdmin() {
      return this.usuario?.tipoPerfil === 'admin'
    }
  },
  created() {
    this.atualizarUsuario()
  },
  mounted() {
    document.addEventListener('click', this.fecharTudo)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.fecharTudo)
  },
  watch: {
    $route() {
      this.fecharTudo()
      this.logado = authStorage.isAuthenticated()
      this.atualizarUsuario()
    }
  },
  methods: {
    toggleMenu() {
      this.menuAberto = !this.menuAberto
    },
    fecharTudo() {
      this.menuAberto = false
    },
    atualizarUsuario() {
      this.usuario = authStorage.getUser()
    },
    sair() {
      authService.logout()
      this.logado = false
      this.usuario = null
      this.fecharTudo()
      this.$router.push('/login')
    }
  }
}
</script>
