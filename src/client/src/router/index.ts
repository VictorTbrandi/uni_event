import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { authStorage, Perfil } from '@/services/api'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    perfis?: Perfil[]
    layout?: 'auth' | 'default'
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/eventos/:id',
    name: 'evento-detalhe',
    component: () => import('../views/EventoDetalheView.vue')
  },
  {
    path: '/palestrantes',
    name: 'palestrantes',
    component: () => import('../views/PalestrantesView.vue')
  },
  {
    path: '/categorias',
    name: 'categorias',
    component: () => import('../views/CategoriasView.vue')
  },
  {
    path: '/assistente-ia',
    name: 'assistente-ia',
    component: () => import('../views/ChatIAView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: () => import('../views/CadastroView.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/recuperar-senha',
    name: 'recuperar-senha',
    component: () => import('../views/RecuperarSenhaView.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/redefinir-senha',
    name: 'redefinir-senha',
    component: () => import('../views/RedefinirSenhaView.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('../views/PerfilView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/minhas-inscricoes',
    name: 'minhas-inscricoes',
    component: () => import('../views/MinhasInscricoesView.vue'),
    meta: { requiresAuth: true, perfis: ['participante', 'admin'] }
  },
  {
    path: '/meus-certificados',
    name: 'meus-certificados',
    component: () => import('../views/MeusCertificadosView.vue'),
    meta: { requiresAuth: true, perfis: ['participante', 'organizador', 'admin'] }
  },
  {
    path: '/meus-certificados/:id',
    name: 'certificado-detalhe',
    component: () => import('../views/CertificadoDetalheView.vue'),
    meta: { requiresAuth: true, perfis: ['participante', 'organizador', 'admin'] }
  },
  {
    path: '/painel/eventos',
    name: 'painel-eventos',
    component: () => import('../views/PainelEventosView.vue'),
    meta: { requiresAuth: true, perfis: ['organizador', 'admin'] }
  },
  {
    path: '/painel/eventos/:id/participantes',
    name: 'painel-evento-participantes',
    component: () => import('../views/PainelParticipantesEventoView.vue'),
    meta: { requiresAuth: true, perfis: ['organizador', 'admin'] }
  },
  {
    path: '/painel/categorias',
    name: 'painel-categorias',
    component: () => import('../views/PainelCategoriasView.vue'),
    meta: { requiresAuth: true, perfis: ['organizador', 'admin'] }
  },
  {
    path: '/painel/palestrantes',
    name: 'painel-palestrantes',
    component: () => import('../views/PainelPalestrantesView.vue'),
    meta: { requiresAuth: true, perfis: ['organizador', 'admin'] }
  },
  {
    path: '/painel/feedbacks/:eventoId',
    name: 'painel-feedbacks',
    component: () => import('../views/PainelFeedbacksView.vue'),
    meta: { requiresAuth: true, perfis: ['organizador', 'admin'] }
  },
  {
    path: '/admin/usuarios',
    name: 'admin-usuarios',
    component: () => import('../views/AdminUsuariosView.vue'),
    meta: { requiresAuth: true, perfis: ['admin'] }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const requiresAuth = to.matched.some((route) => route.meta.requiresAuth)

  if (requiresAuth && !authStorage.isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const perfisPermitidos = to.matched.flatMap((route) => route.meta.perfis || [])
  if (perfisPermitidos.length && !authStorage.hasPerfil(perfisPermitidos)) {
    return { name: 'home' }
  }

  if ((to.name === 'login' || to.name === 'cadastro') && authStorage.isAuthenticated()) {
    return { name: 'home' }
  }
})

export default router
