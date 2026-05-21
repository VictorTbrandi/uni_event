<template>
  <div>
    <div class="page-header">
      <h1>Assistente IA</h1>
    </div>

    <section class="painel-card chat-ia-card">
      <div ref="mensagensContainer" class="chat-ia-mensagens">
        <article
          v-for="(item, index) in mensagens"
          :key="index"
          :class="['chat-ia-balao', item.autor === 'usuario' ? 'chat-ia-usuario' : 'chat-ia-bot']"
        >
          <span>{{ item.autor === 'usuario' ? 'Voce' : 'Assistente IA' }}</span>
          <p>{{ item.texto }}</p>
        </article>

        <article v-if="carregando" class="chat-ia-balao chat-ia-bot">
          <span>Assistente IA</span>
          <p>Digitando resposta...</p>
        </article>
      </div>

      <div v-if="sugestoes.length" class="chat-ia-sugestoes">
        <button
          v-for="sugestao in sugestoes"
          :key="sugestao"
          type="button"
          class="btn-mini"
          :disabled="carregando"
          @click="usarSugestao(sugestao)"
        >
          {{ sugestao }}
        </button>
      </div>

      <div v-if="erro" class="estado-erro form-erro">{{ erro }}</div>

      <form class="chat-ia-form" @submit.prevent="enviar">
        <textarea
          v-model="mensagem"
          rows="3"
          maxlength="800"
          placeholder="Pergunte sobre eventos, inscricoes, certificados, feedbacks ou uso do sistema"
          required
        ></textarea>
        <button type="submit" class="btn-submit" :disabled="carregando || !mensagem.trim()">
          {{ carregando ? 'Enviando...' : 'Enviar' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import { iaService } from '@/services/iaService'

export default {
  name: 'ChatIAView',
  data() {
    return {
      mensagem: '',
      mensagens: [
        {
          autor: 'ia',
          texto: 'Ola! Sou o assistente do UniEvent. Posso ajudar com eventos, inscricoes, certificados, feedbacks e uso do painel.'
        }
      ],
      sugestoes: [
        'Como faco inscricao em um evento?',
        'Como vejo meus certificados?',
        'Como funciona o resumo de feedbacks?'
      ],
      carregando: false,
      erro: null
    }
  },
  methods: {
    async enviar() {
      const texto = this.mensagem.trim()
      if (!texto || this.carregando) return

      this.mensagens.push({ autor: 'usuario', texto })
      this.mensagem = ''
      this.carregando = true
      this.erro = null
      this.rolarParaFim()

      try {
        const historico = this.mensagens.slice(-10)
        const data = await iaService.chat(texto, historico)
        this.mensagens.push({ autor: 'ia', texto: data.resposta })
        this.sugestoes = data.sugestoes || []
      } catch (error) {
        this.erro = error.message || 'Nao foi possivel conversar com a IA.'
      } finally {
        this.carregando = false
        this.rolarParaFim()
      }
    },
    usarSugestao(texto) {
      this.mensagem = texto
      this.enviar()
    },
    rolarParaFim() {
      this.$nextTick(() => {
        const container = this.$refs.mensagensContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  }
}
</script>
