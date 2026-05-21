<template>
  <div>
    <div class="page-header">
      <h1>Participantes</h1>
    </div>

    <div v-if="carregando" class="estado-loading">Carregando participantes...</div>
    <div v-else-if="erro" class="estado-erro">{{ erro }}</div>
    <section v-else class="painel-card">
      <div class="linha-entre painel-card-titulo">
        <h2>{{ evento?.titulo }}</h2>
        <button class="btn-secundario" type="button" @click="$router.back()">Voltar</button>
      </div>

      <div v-if="participantes.length === 0" class="estado-vazio">Nenhum participante inscrito.</div>
      <div v-else class="tabela-responsiva">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Curso</th>
              <th>RA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inscricao in participantes" :key="inscricao._id">
              <td>{{ inscricao.usuarioId.nome }}</td>
              <td>{{ inscricao.usuarioId.email }}</td>
              <td>{{ inscricao.usuarioId.curso || '-' }}</td>
              <td>{{ inscricao.usuarioId.ra || '-' }}</td>
              <td><span :class="['status-tag', `status-${inscricao.status}`]">{{ formatarStatus(inscricao.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import { eventoService } from '@/services/eventoService'
import { formatarStatus } from '@/utils/formatters'

export default {
  name: 'PainelParticipantesEventoView',
  data() {
    return {
      evento: null,
      participantes: [],
      carregando: true,
      erro: null
    }
  },
  async created() {
    await this.carregarDados()
  },
  methods: {
    formatarStatus,
    async carregarDados() {
      try {
        const id = this.$route.params.id
        const [evento, participantes] = await Promise.all([
          eventoService.buscarPorId(id),
          eventoService.participantes(id)
        ])
        this.evento = evento
        this.participantes = participantes
      } catch (error) {
        this.erro = error.message || 'Erro ao carregar participantes.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
