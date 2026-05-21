<template>
  <div id="app">
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

    <template v-else>
      <nav class="navbar">
        <div class="navbar-inner">
          <router-link to="/" class="navbar-brand">Uni<span>Event</span></router-link>

          <div class="nav-menu-wrapper" @click.stop>
            <button class="nav-menu-btn" aria-label="Menu" @click="toggleMenu">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div class="nav-dropdown" :class="{ 'is-open': menuAberto }">
              <div v-if="logado" class="nav-usuario-card">
                <span class="nav-usuario-nome">{{ nomeUsuario }}</span>
                <span class="nav-usuario-perfil">{{ labelPerfil }}</span>
              </div>

              <div class="nav-grupo">
                <span class="nav-secao-label">Eventos</span>
                <router-link to="/" @click="fecharTudo">Agenda de eventos</router-link>
                <router-link v-if="podeGerenciar" to="/palestrantes" @click="fecharTudo">Palestrantes</router-link>
                <router-link v-if="podeGerenciar" to="/categorias" @click="fecharTudo">Categorias</router-link>
              </div>

              <div class="nav-grupo">
                <span class="nav-secao-label">Suporte</span>
                <router-link to="/assistente-ia" @click="fecharTudo">Assistente IA</router-link>
              </div>

              <template v-if="!logado">
                <div class="nav-dropdown-divider"></div>
                <div class="nav-grupo">
                  <span class="nav-secao-label">Acesso</span>
                  <router-link to="/login" @click="fecharTudo">Entrar</router-link>
                  <router-link to="/cadastro" class="nav-item-destaque" @click="fecharTudo">Cadastrar</router-link>
                </div>
              </template>

              <template v-else>
                <template v-if="podeAdmin">
                  <div class="nav-dropdown-divider"></div>
                  <div class="nav-grupo">
                    <span class="nav-secao-label">Administração</span>
                    <router-link to="/admin/usuarios" @click="fecharTudo">Usuários</router-link>
                  </div>
                </template>

                <div class="nav-dropdown-divider"></div>
                <div class="nav-grupo">
                  <span class="nav-secao-label">Minha conta</span>
                  <router-link v-if="podeParticipante" to="/minhas-inscricoes" @click="fecharTudo">Inscrições</router-link>
                  <router-link to="/meus-certificados" @click="fecharTudo">Certificados</router-link>
                  <router-link to="/perfil" @click="fecharTudo">Perfil</router-link>
                </div>

                <div class="nav-dropdown-divider"></div>
                <div class="nav-grupo">
                  <a href="#" class="nav-sair" @click.prevent="sair">Sair</a>
                </div>
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
    podeGerenciar() {
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
