<template>
  <div>
    <div class="page-header">
      <h1>Minhas Inscrições</h1>
    </div>

    <div v-if="carregando" class="estado-loading">Carregando inscrições...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
    <div v-else-if="inscricoes.length === 0" class="estado-vazio">
      Você ainda não possui inscrições.
    </div>

    <div v-else class="lista-vertical">
      <article v-for="inscricao in inscricoes" :key="inscricao._id" class="painel-card">
        <div class="linha-entre">
          <div>
            <h3>{{ evento(inscricao).titulo }}</h3>
            <p v-if="eventoDisponivel(inscricao)">
              {{ formatarData(evento(inscricao).data) }} - {{ evento(inscricao).horarioInicio }} - {{ evento(inscricao).horarioFim }}
            </p>
            <p>{{ evento(inscricao).local }}</p>
          </div>
          <span :class="['status-tag', `status-${inscricao.status}`]">{{ formatarStatus(inscricao.status) }}</span>
        </div>

        <div class="card-acoes card-acoes-linha">
          <router-link v-if="eventoDisponivel(inscricao)" :to="`/eventos/${evento(inscricao)._id}`" class="btn-detalhe">
            Ver evento
          </router-link>
          <span v-else class="btn-detalhe btn-detalhe-disabled">Evento indisponivel</span>
          <button
            v-if="podeCancelar(inscricao)"
            type="button"
            class="btn-perigo"
            :disabled="inscricao.status === 'cancelada' || cancelandoId === inscricao._id"
            @click="cancelar(inscricao)"
          >
            {{ cancelandoId === inscricao._id ? 'Cancelando...' : 'Cancelar inscrição' }}
          </button>
          <span v-else-if="inscricao.status !== 'cancelada'" class="texto-suave inscricao-bloqueio">
            Cancelamento indisponivel apos a realizacao do evento.
          </span>
        </div>

        <form v-if="podeEnviarFeedback(inscricao)" class="feedback-form" @submit.prevent="enviarFeedback(inscricao)">
          <div class="form-grid">
            <div class="form-group">
              <label>Nota</label>
              <select v-model.number="feedbacks[inscricao._id].nota" required>
                <option :value="5">5</option>
                <option :value="4">4</option>
                <option :value="3">3</option>
                <option :value="2">2</option>
                <option :value="1">1</option>
              </select>
            </div>
            <div class="form-group">
              <label>Comentário</label>
              <input v-model="feedbacks[inscricao._id].comentario" type="text" placeholder="Como foi o evento?" />
            </div>
          </div>
          <button type="submit" :disabled="feedbacks[inscricao._id].carregando" class="btn-submit">
            {{ feedbacks[inscricao._id].carregando ? 'Enviando...' : 'Enviar feedback' }}
          </button>
          <div
            v-if="feedbacks[inscricao._id].mensagem"
            :class="['detalhe-mensagem', feedbacks[inscricao._id].tipo]"
          >
            {{ feedbacks[inscricao._id].mensagem }}
          </div>
        </form>
      </article>
    </div>
  </div>
</template>

<script>
import { feedbackService } from '@/services/feedbackService'
import { inscricaoService } from '@/services/inscricaoService'
import { formatarData, formatarStatus } from '@/utils/formatters'

export default {
  name: 'MinhasInscricoesView',
  data() {
    return {
      inscricoes: [],
      feedbacks: {},
      carregando: true,
      cancelandoId: null,
      erro: null
    }
  },
  async created() {
    await this.carregarInscricoes()
  },
  methods: {
    formatarData,
    formatarStatus,
    async carregarInscricoes() {
      try {
        this.inscricoes = await inscricaoService.minhas()
        this.inscricoes.forEach((inscricao) => {
          this.feedbacks[inscricao._id] = {
            nota: 5,
            comentario: '',
            carregando: false,
            mensagem: '',
            tipo: ''
          }
        })
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar inscrições.'
      } finally {
        this.carregando = false
      }
    },
    evento(inscricao) {
      if (inscricao.eventoId && typeof inscricao.eventoId === 'object') {
        return inscricao.eventoId
      }

      return {
        _id: null,
        titulo: 'Evento removido ou indisponivel',
        data: null,
        horarioInicio: '',
        horarioFim: '',
        local: 'Detalhes do evento indisponiveis',
        status: 'fechado'
      }
    },
    eventoDisponivel(inscricao) {
      return Boolean(this.evento(inscricao)._id)
    },
    podeEnviarFeedback(inscricao) {
      return this.eventoDisponivel(inscricao) && this.evento(inscricao).status === 'encerrado' && inscricao.status !== 'cancelada'
    },
    podeCancelar(inscricao) {
      return (
        this.eventoDisponivel(inscricao) &&
        this.evento(inscricao).status !== 'encerrado' &&
        inscricao.status !== 'cancelada'
      )
    },
    async cancelar(inscricao) {
      this.cancelandoId = inscricao._id
      this.erro = null

      try {
        const atualizada = await inscricaoService.cancelar(inscricao._id)
        inscricao.status = atualizada.status
      } catch (error) {
        this.erro = error.message || 'Erro ao cancelar inscrição.'
      } finally {
        this.cancelandoId = null
      }
    },
    async enviarFeedback(inscricao) {
      const feedback = this.feedbacks[inscricao._id]
      feedback.carregando = true
      feedback.mensagem = ''

      try {
        await feedbackService.enviar({
          eventoId: this.evento(inscricao)._id,
          nota: feedback.nota,
          comentario: feedback.comentario
        })
        feedback.mensagem = 'Feedback enviado com sucesso.'
        feedback.tipo = 'sucesso'
      } catch (error) {
        feedback.mensagem = error.message || 'Erro ao enviar feedback.'
        feedback.tipo = 'erro'
      } finally {
        feedback.carregando = false
      }
    }
  }
}
</script>
