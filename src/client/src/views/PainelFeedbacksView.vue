<template>
  <div>
    <div class="page-header">
      <h1>Feedbacks</h1>
    </div>

    <div v-if="carregando" class="estado-loading">Carregando feedbacks...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>

    <section v-else class="painel-card">
      <div class="linha-entre painel-card-titulo">
        <h2>{{ evento?.titulo }}</h2>
        <button class="btn-secundario" type="button" @click="$router.back()">Voltar</button>
      </div>

      <div class="card-acoes card-acoes-linha ia-acoes">
        <button type="button" :disabled="gerandoResumo" @click="resumir">
          {{ gerandoResumo ? 'Gerando...' : 'Resumir feedbacks' }}
        </button>
        <button type="button" :disabled="classificando" @click="classificar">
          {{ classificando ? 'Classificando...' : 'Classificar satisfação' }}
        </button>
      </div>

      <div v-if="erroAcao" class="estado-erro form-erro">{{ erroAcao }}</div>

      <div v-if="resumo" class="resultado-ia">
        <h3>Resumo</h3>
        <p>{{ resumo.resumo }}</p>
        <p>{{ resumo.quantidade }} feedback(s) · média {{ Number(resumo.media).toFixed(1) }}</p>
      </div>

      <div v-if="satisfacao" class="resultado-ia">
        <h3>Satisfação</h3>
        <p>{{ satisfacao.classificacao }} · média {{ Number(satisfacao.media).toFixed(1) }}</p>
      </div>

      <div v-if="feedbacks.length === 0" class="estado-vazio">Nenhum feedback recebido.</div>
      <div v-else class="lista-vertical">
        <article v-for="feedback in feedbacks" :key="feedback._id" class="item-linha">
          <div>
            <h3>{{ feedback.usuarioId.nome }}</h3>
            <p>{{ feedback.usuarioId.email }} · Nota {{ feedback.nota }}/5</p>
            <p>{{ feedback.comentario || 'Sem comentário.' }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
import { eventoService } from '@/services/eventoService'
import { iaService } from '@/services/iaService'

export default {
  name: 'PainelFeedbacksView',
  data() {
    return {
      evento: null,
      feedbacks: [],
      resumo: null,
      satisfacao: null,
      carregando: true,
      gerandoResumo: false,
      classificando: false,
      erro: null,
      erroAcao: null
    }
  },
  async created() {
    await this.carregarDados()
  },
  methods: {
    async carregarDados() {
      const id = this.$route.params.eventoId
      try {
        const [evento, feedbacks] = await Promise.all([
          eventoService.buscarPorId(id),
          eventoService.feedbacks(id)
        ])
        this.evento = evento
        this.feedbacks = feedbacks
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar feedbacks.'
      } finally {
        this.carregando = false
      }
    },
    async resumir() {
      this.gerandoResumo = true
      this.erroAcao = null

      try {
        this.resumo = await iaService.resumirFeedbacks(this.$route.params.eventoId)
      } catch (error) {
        this.erroAcao = error.message || 'Erro ao resumir feedbacks.'
      } finally {
        this.gerandoResumo = false
      }
    },
    async classificar() {
      this.classificando = true
      this.erroAcao = null

      try {
        this.satisfacao = await iaService.classificarSatisfacao(this.$route.params.eventoId)
      } catch (error) {
        this.erroAcao = error.message || 'Erro ao classificar satisfação.'
      } finally {
        this.classificando = false
      }
    }
  }
}
</script>
