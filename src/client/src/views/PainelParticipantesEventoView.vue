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
        <div class="card-acoes card-acoes-linha">
          <button
            v-if="podeEmitirCertificados"
            type="button"
            :disabled="emitindoCertificados"
            @click="emitirCertificados"
          >
            {{ emitindoCertificados ? 'Emitindo...' : 'Emitir certificados' }}
          </button>
          <button class="btn-secundario" type="button" @click="$router.back()">Voltar</button>
        </div>
      </div>

      <div v-if="mensagem" :class="['detalhe-mensagem', mensagemTipo]">{{ mensagem }}</div>

      <div v-if="participantes.length === 0" class="estado-vazio">Nenhum participante inscrito.</div>
      <div v-else class="tabela-responsiva">
        <table class="tabela-com-icones">
          <thead>
            <tr>
              <th><span class="th-conteudo"><IconUser :size="14" stroke-width="1.75" aria-hidden="true" />Nome</span></th>
              <th><span class="th-conteudo"><IconMail :size="14" stroke-width="1.75" aria-hidden="true" />E-mail</span></th>
              <th><span class="th-conteudo"><IconBook :size="14" stroke-width="1.75" aria-hidden="true" />Curso</span></th>
              <th><span class="th-conteudo"><IconHash :size="14" stroke-width="1.75" aria-hidden="true" />RA</span></th>
              <th><span class="th-conteudo"><IconCircleDot :size="14" stroke-width="1.75" aria-hidden="true" />Status</span></th>
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
import {
  IconUser,
  IconMail,
  IconBook,
  IconHash,
  IconCircleDot
} from '@tabler/icons-vue'
import { authStorage } from '@/services/api'
import { certificadoService } from '@/services/certificadoService'
import { eventoService } from '@/services/eventoService'
import { mensagemEmissaoCertificados } from '@/utils/certificados'
import { formatarStatus } from '@/utils/formatters'

export default {
  name: 'PainelParticipantesEventoView',
  components: {
    IconUser,
    IconMail,
    IconBook,
    IconHash,
    IconCircleDot
  },
  data() {
    return {
      evento: null,
      participantes: [],
      carregando: true,
      emitindoCertificados: false,
      erro: null,
      mensagem: null,
      mensagemTipo: ''
    }
  },
  computed: {
    usuario() {
      return authStorage.getUser()
    },
    organizadorId() {
      return typeof this.evento?.organizadorId === 'object' ? this.evento.organizadorId._id : this.evento?.organizadorId
    },
    podeEmitirCertificados() {
      if (!this.evento?.permiteCertificado || this.evento?.status !== 'encerrado') return false
      if (this.usuario?.tipoPerfil === 'admin') return true
      return String(this.organizadorId) === String(this.usuario?._id)
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
    },
    async emitirCertificados() {
      this.emitindoCertificados = true
      this.mensagem = null

      try {
        const resultado = await certificadoService.emitirPorEvento(this.evento._id)
        this.mensagem = mensagemEmissaoCertificados(resultado)
        this.mensagemTipo = 'sucesso'
        await this.carregarDados()
      } catch (error) {
        this.mensagem = error.message || 'Erro ao emitir certificados.'
        this.mensagemTipo = 'erro'
      } finally {
        this.emitindoCertificados = false
      }
    }
  }
}
</script>
