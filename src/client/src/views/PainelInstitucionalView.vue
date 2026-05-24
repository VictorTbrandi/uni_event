<template>
  <div>
    <div class="page-header page-header-acoes">
      <div class="page-header-titulo">
        <div class="linha-titulo-role">
          <h1>Painel Institucional</h1>
          <span class="role-pill">Admin</span>
        </div>
        <p class="page-subtitle">
          Cadastre universidades, campi, departamentos e cursos. Esses dados serao usados nos eventos e nos perfis.
        </p>
      </div>
    </div>

    <nav class="tabs-institucional" role="tablist">
      <button
        v-for="aba in abas"
        :key="aba.valor"
        type="button"
        role="tab"
        :class="['tab-institucional', { 'is-ativa': abaAtiva === aba.valor }]"
        :aria-selected="abaAtiva === aba.valor"
        @click="abaAtiva = aba.valor"
      >
        {{ aba.rotulo }}
      </button>
    </nav>

    <!-- ============ UNIVERSIDADES ============ -->
    <section v-if="abaAtiva === 'universidades'">
      <div class="card-acoes card-acoes-linha card-acoes-topo">
        <button type="button" class="btn-submit" :disabled="formUniAberto" @click="abrirFormUni()">
          {{ formUniAberto ? 'Formulario aberto' : 'Cadastrar universidade' }}
        </button>
      </div>

      <section v-if="formUniAberto" class="painel-card crud-form-card">
        <h2>{{ uniEditandoId ? 'Editar universidade' : 'Cadastrar universidade' }}</h2>
        <div v-if="erroUni" class="estado-erro form-erro">{{ erroUni }}</div>

        <form @submit.prevent="salvarUni">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome</label>
              <input v-model="formUni.nome" type="text" required maxlength="150" />
            </div>
            <div class="form-group">
              <label>Sigla</label>
              <input v-model="formUni.sigla" type="text" required maxlength="20" />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Cidade</label>
              <input v-model="formUni.cidade" type="text" maxlength="120" />
            </div>
            <div class="form-group">
              <label>UF</label>
              <select v-model="formUni.uf">
                <option value="">Selecione</option>
                <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Endereco</label>
            <input v-model="formUni.endereco" type="text" maxlength="250" />
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Site</label>
              <input v-model="formUni.site" type="url" placeholder="https://..." maxlength="200" />
            </div>
            <div class="form-group">
              <label>CNPJ</label>
              <input v-model="formUni.cnpj" type="text" maxlength="18" />
            </div>
          </div>
          <div class="form-group">
            <label>Logo (URL)</label>
            <input v-model="formUni.logoUrl" type="url" placeholder="https://..." maxlength="500" />
          </div>
          <div class="form-group">
            <label>Descricao</label>
            <textarea v-model="formUni.descricao" rows="3" maxlength="1000"></textarea>
          </div>

          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvandoUni" class="btn-submit">
              {{ salvandoUni ? 'Salvando...' : (uniEditandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
            </button>
            <button type="button" class="btn-secundario" @click="fecharFormUni">Cancelar</button>
          </div>
        </form>
      </section>

      <div v-if="carregando" class="estado-loading">Carregando universidades...</div>
      <div v-else-if="universidades.length === 0" class="estado-vazio">
        Nenhuma universidade cadastrada ainda.
      </div>
      <div v-else class="cards-institucionais">
        <article v-for="u in universidades" :key="u._id" class="institucional-card">
          <header class="institucional-card-header">
            <div class="institucional-card-titulo">
              <strong>{{ u.sigla }}</strong>
              <span>{{ u.nome }}</span>
            </div>
            <span v-if="!u.ativo" class="status-tag status-cancelado">Inativa</span>
          </header>
          <div class="institucional-card-corpo">
            <p v-if="u.descricao">{{ u.descricao }}</p>
            <p v-if="u.cidade || u.uf" class="texto-suave">{{ [u.cidade, u.uf].filter(Boolean).join('/') }}</p>
            <a v-if="u.site" :href="u.site" target="_blank" rel="noopener" class="link-suave">{{ u.site }}</a>
          </div>
          <div class="card-acoes">
            <button type="button" class="btn-mini" @click="editarUni(u)">Editar</button>
            <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusaoUni(u)">Excluir</button>
          </div>
        </article>
      </div>
    </section>

    <!-- ============ CAMPI ============ -->
    <section v-if="abaAtiva === 'campi'">
      <div class="card-acoes card-acoes-linha card-acoes-topo">
        <button
          type="button"
          class="btn-submit"
          :disabled="universidades.length === 0 || formCampusAberto"
          @click="abrirFormCampus()"
        >
          {{ formCampusAberto ? 'Formulario aberto' : 'Cadastrar campus' }}
        </button>
      </div>

      <div v-if="universidades.length === 0" class="estado-erro form-erro">
        Cadastre uma universidade antes de criar campi.
      </div>

      <section v-if="formCampusAberto" class="painel-card crud-form-card">
        <h2>{{ campusEditandoId ? 'Editar campus' : 'Cadastrar campus' }}</h2>
        <div v-if="erroCampus" class="estado-erro form-erro">{{ erroCampus }}</div>

        <form @submit.prevent="salvarCampus">
          <div class="form-grid">
            <div class="form-group">
              <label>Universidade</label>
              <select v-model="formCampus.universidadeId" required>
                <option value="">Selecione</option>
                <option v-for="u in universidades" :key="u._id" :value="u._id">{{ u.sigla }} - {{ u.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nome</label>
              <input v-model="formCampus.nome" type="text" required maxlength="120" />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Sigla</label>
              <input v-model="formCampus.sigla" type="text" maxlength="20" />
            </div>
            <div class="form-group">
              <label>Cidade</label>
              <input v-model="formCampus.cidade" type="text" maxlength="120" />
            </div>
            <div class="form-group">
              <label>UF</label>
              <select v-model="formCampus.uf">
                <option value="">Selecione</option>
                <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Endereco</label>
            <input v-model="formCampus.endereco" type="text" maxlength="250" />
          </div>

          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvandoCampus" class="btn-submit">
              {{ salvandoCampus ? 'Salvando...' : (campusEditandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
            </button>
            <button type="button" class="btn-secundario" @click="fecharFormCampus">Cancelar</button>
          </div>
        </form>
      </section>

      <div v-if="carregando" class="estado-loading">Carregando campi...</div>
      <div v-else-if="campi.length === 0" class="estado-vazio">Nenhum campus cadastrado ainda.</div>
      <div v-else class="cards-institucionais">
        <article v-for="c in campi" :key="c._id" class="institucional-card">
          <header class="institucional-card-header">
            <div class="institucional-card-titulo">
              <strong>{{ c.sigla || c.nome }}</strong>
              <span>{{ c.nome }}</span>
            </div>
          </header>
          <div class="institucional-card-corpo">
            <p class="texto-suave">{{ nomeUniversidadeRef(c.universidadeId) }}</p>
            <p v-if="c.cidade || c.uf" class="texto-suave">{{ [c.cidade, c.uf].filter(Boolean).join('/') }}</p>
            <p v-if="c.endereco" class="texto-suave">{{ c.endereco }}</p>
          </div>
          <div class="card-acoes">
            <button type="button" class="btn-mini" @click="editarCampus(c)">Editar</button>
            <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusaoCampus(c)">Excluir</button>
          </div>
        </article>
      </div>
    </section>

    <!-- ============ DEPARTAMENTOS ============ -->
    <section v-if="abaAtiva === 'departamentos'">
      <div class="card-acoes card-acoes-linha card-acoes-topo">
        <button
          type="button"
          class="btn-submit"
          :disabled="universidades.length === 0 || formDepAberto"
          @click="abrirFormDep()"
        >
          {{ formDepAberto ? 'Formulario aberto' : 'Cadastrar departamento' }}
        </button>
      </div>

      <div v-if="universidades.length === 0" class="estado-erro form-erro">
        Cadastre uma universidade antes de criar departamentos.
      </div>

      <section v-if="formDepAberto" class="painel-card crud-form-card">
        <h2>{{ depEditandoId ? 'Editar departamento' : 'Cadastrar departamento' }}</h2>
        <div v-if="erroDep" class="estado-erro form-erro">{{ erroDep }}</div>

        <form @submit.prevent="salvarDep">
          <div class="form-grid">
            <div class="form-group">
              <label>Universidade</label>
              <select v-model="formDep.universidadeId" required>
                <option value="">Selecione</option>
                <option v-for="u in universidades" :key="u._id" :value="u._id">{{ u.sigla }} - {{ u.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nome</label>
              <input v-model="formDep.nome" type="text" required maxlength="150" />
            </div>
            <div class="form-group">
              <label>Sigla</label>
              <input v-model="formDep.sigla" type="text" maxlength="20" />
            </div>
          </div>
          <div class="form-group">
            <label>Descricao</label>
            <textarea v-model="formDep.descricao" rows="3" maxlength="500"></textarea>
          </div>

          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvandoDep" class="btn-submit">
              {{ salvandoDep ? 'Salvando...' : (depEditandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
            </button>
            <button type="button" class="btn-secundario" @click="fecharFormDep">Cancelar</button>
          </div>
        </form>
      </section>

      <div v-if="carregando" class="estado-loading">Carregando departamentos...</div>
      <div v-else-if="departamentos.length === 0" class="estado-vazio">Nenhum departamento cadastrado ainda.</div>
      <div v-else class="cards-institucionais">
        <article v-for="d in departamentos" :key="d._id" class="institucional-card">
          <header class="institucional-card-header">
            <div class="institucional-card-titulo">
              <strong>{{ d.sigla || d.nome }}</strong>
              <span>{{ d.nome }}</span>
            </div>
          </header>
          <div class="institucional-card-corpo">
            <p class="texto-suave">{{ nomeUniversidadeRef(d.universidadeId) }}</p>
            <p v-if="d.descricao">{{ d.descricao }}</p>
          </div>
          <div class="card-acoes">
            <button type="button" class="btn-mini" @click="editarDep(d)">Editar</button>
            <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusaoDep(d)">Excluir</button>
          </div>
        </article>
      </div>
    </section>

    <!-- ============ CURSOS ============ -->
    <section v-if="abaAtiva === 'cursos'">
      <div class="card-acoes card-acoes-linha card-acoes-topo">
        <button
          type="button"
          class="btn-submit"
          :disabled="universidades.length === 0 || formCursoAberto"
          @click="abrirFormCurso()"
        >
          {{ formCursoAberto ? 'Formulario aberto' : 'Cadastrar curso' }}
        </button>
      </div>

      <div v-if="universidades.length === 0" class="estado-erro form-erro">
        Cadastre uma universidade antes de criar cursos.
      </div>

      <section v-if="formCursoAberto" class="painel-card crud-form-card">
        <h2>{{ cursoEditandoId ? 'Editar curso' : 'Cadastrar curso' }}</h2>
        <div v-if="erroCurso" class="estado-erro form-erro">{{ erroCurso }}</div>

        <form @submit.prevent="salvarCurso">
          <div class="form-grid">
            <div class="form-group">
              <label>Universidade</label>
              <select v-model="formCurso.universidadeId" required>
                <option value="">Selecione</option>
                <option v-for="u in universidades" :key="u._id" :value="u._id">{{ u.sigla }} - {{ u.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <select v-model="formCurso.departamentoId">
                <option value="">Sem departamento</option>
                <option v-for="d in departamentosDaUniSelecionada" :key="d._id" :value="d._id">{{ d.nome }}</option>
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome do curso</label>
              <input v-model="formCurso.nome" type="text" required maxlength="150" />
            </div>
            <div class="form-group">
              <label>Grau</label>
              <select v-model="formCurso.grau" required>
                <option v-for="g in grausOpcoes" :key="g.valor" :value="g.valor">{{ g.rotulo }}</option>
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Carga horaria total</label>
              <input v-model.number="formCurso.cargaHorariaTotal" type="number" min="1" />
            </div>
            <div class="form-group">
              <label>Duracao (semestres)</label>
              <input v-model.number="formCurso.duracaoSemestres" type="number" min="1" max="20" />
            </div>
          </div>
          <div class="form-group">
            <label>Descricao</label>
            <textarea v-model="formCurso.descricao" rows="3" maxlength="1000"></textarea>
          </div>

          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvandoCurso" class="btn-submit">
              {{ salvandoCurso ? 'Salvando...' : (cursoEditandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
            </button>
            <button type="button" class="btn-secundario" @click="fecharFormCurso">Cancelar</button>
          </div>
        </form>
      </section>

      <div v-if="carregando" class="estado-loading">Carregando cursos...</div>
      <div v-else-if="cursos.length === 0" class="estado-vazio">Nenhum curso cadastrado ainda.</div>
      <div v-else class="cards-institucionais">
        <article v-for="c in cursos" :key="c._id" class="institucional-card">
          <header class="institucional-card-header">
            <div class="institucional-card-titulo">
              <strong>{{ c.nome }}</strong>
              <span class="tag">{{ rotuloGrau(c.grau) }}</span>
            </div>
          </header>
          <div class="institucional-card-corpo">
            <p class="texto-suave">{{ nomeUniversidadeRef(c.universidadeId) }}</p>
            <p v-if="c.departamentoId" class="texto-suave">{{ nomeDepartamentoRef(c.departamentoId) }}</p>
            <p v-if="c.cargaHorariaTotal" class="texto-suave">{{ c.cargaHorariaTotal }}h totais</p>
            <p v-if="c.duracaoSemestres" class="texto-suave">{{ c.duracaoSemestres }} semestres</p>
            <p v-if="c.descricao">{{ c.descricao }}</p>
          </div>
          <div class="card-acoes">
            <button type="button" class="btn-mini" @click="editarCurso(c)">Editar</button>
            <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusaoCurso(c)">Excluir</button>
          </div>
        </article>
      </div>
    </section>

    <!-- ============ SALAS ============ -->
    <section v-if="abaAtiva === 'salas'">
      <div class="card-acoes card-acoes-linha card-acoes-topo">
        <button
          type="button"
          class="btn-submit"
          :disabled="universidades.length === 0 || formSalaAberto"
          @click="abrirFormSala()"
        >
          {{ formSalaAberto ? 'Formulario aberto' : 'Cadastrar sala' }}
        </button>
      </div>

      <div v-if="universidades.length === 0" class="estado-erro form-erro">
        Cadastre uma universidade antes de criar salas.
      </div>

      <section v-if="formSalaAberto" class="painel-card crud-form-card">
        <h2>{{ salaEditandoId ? 'Editar sala' : 'Cadastrar sala' }}</h2>
        <div v-if="erroSala" class="estado-erro form-erro">{{ erroSala }}</div>

        <form @submit.prevent="salvarSala">
          <div class="form-grid">
            <div class="form-group">
              <label>Universidade</label>
              <select v-model="formSala.universidadeId" required>
                <option value="">Selecione</option>
                <option v-for="u in universidades" :key="u._id" :value="u._id">{{ u.sigla }} - {{ u.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Campus</label>
              <select v-model="formSala.campusId" :disabled="!formSala.universidadeId">
                <option value="">Sem campus</option>
                <option v-for="c in campiDaSalaUniSelecionada" :key="c._id" :value="c._id">{{ c.nome }}</option>
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome da sala</label>
              <input v-model="formSala.nome" type="text" required maxlength="120" />
            </div>
            <div class="form-group">
              <label>Bloco / Predio</label>
              <input v-model="formSala.bloco" type="text" maxlength="40" />
            </div>
            <div class="form-group">
              <label>Capacidade</label>
              <input v-model.number="formSala.capacidade" type="number" min="1" required />
            </div>
          </div>
          <div class="form-group">
            <label>Recursos disponiveis</label>
            <div class="checkbox-lista checkbox-lista-grid">
              <label v-for="r in recursosOpcoes" :key="r.valor" class="checkbox-opcao checkbox-opcao-compact">
                <input v-model="formSala.recursos" type="checkbox" :value="r.valor" />
                <span><strong>{{ r.rotulo }}</strong></span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Observacoes</label>
            <textarea v-model="formSala.observacoes" rows="2" maxlength="500"></textarea>
          </div>

          <div class="card-acoes card-acoes-linha">
            <button type="submit" :disabled="salvandoSala" class="btn-submit">
              {{ salvandoSala ? 'Salvando...' : (salaEditandoId ? 'Salvar alteracoes' : 'Cadastrar') }}
            </button>
            <button type="button" class="btn-secundario" @click="fecharFormSala">Cancelar</button>
          </div>
        </form>
      </section>

      <div v-if="carregando" class="estado-loading">Carregando salas...</div>
      <div v-else-if="salas.length === 0" class="estado-vazio">Nenhuma sala cadastrada ainda.</div>
      <div v-else class="cards-institucionais">
        <article v-for="s in salas" :key="s._id" class="institucional-card">
          <header class="institucional-card-header">
            <div class="institucional-card-titulo">
              <strong>{{ s.nome }}</strong>
              <span v-if="s.bloco">Bloco {{ s.bloco }}</span>
            </div>
            <span class="tag">{{ s.capacidade }} lugares</span>
          </header>
          <div class="institucional-card-corpo">
            <p class="texto-suave">{{ nomeUniversidadeRef(s.universidadeId) }}</p>
            <p v-if="s.campusId" class="texto-suave">{{ nomeCampusRef(s.campusId) }}</p>
            <div v-if="s.recursos && s.recursos.length" class="lista-tags" style="margin-top: 6px;">
              <span v-for="r in s.recursos" :key="r" class="tag tag-neutra">{{ rotuloRecurso(r) }}</span>
            </div>
            <p v-if="s.observacoes" style="margin-top: 6px;">{{ s.observacoes }}</p>
          </div>
          <div class="card-acoes">
            <button type="button" class="btn-mini" @click="editarSala(s)">Editar</button>
            <button type="button" class="btn-mini btn-mini-perigo" @click="pedirExclusaoSala(s)">Excluir</button>
          </div>
        </article>
      </div>
    </section>

    <ConfirmModal
      :aberto="Boolean(itemParaExcluir)"
      :titulo="mensagemExclusao.titulo"
      :mensagem="mensagemExclusao.mensagem"
      texto-confirmar="Excluir"
      @cancelar="itemParaExcluir = null"
      @confirmar="confirmarExclusao"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/ConfirmModal.vue'
import { universidadeService } from '@/services/universidadeService'
import { campusService } from '@/services/campusService'
import { departamentoService } from '@/services/departamentoService'
import { cursoService, grausPermitidos } from '@/services/cursoService'
import { salaService, recursosPermitidos } from '@/services/salaService'
import { toastService } from '@/services/toastService'

const ufsBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const formUniInicial = () => ({
  nome: '', sigla: '', cnpj: '', site: '', logoUrl: '',
  cidade: '', uf: '', endereco: '', descricao: ''
})

const formCampusInicial = () => ({
  universidadeId: '', nome: '', sigla: '',
  endereco: '', cidade: '', uf: ''
})

const formDepInicial = () => ({
  universidadeId: '', nome: '', sigla: '', descricao: ''
})

const formCursoInicial = () => ({
  universidadeId: '', departamentoId: '',
  nome: '', grau: 'graduacao',
  cargaHorariaTotal: null, duracaoSemestres: null,
  descricao: ''
})

const formSalaInicial = () => ({
  universidadeId: '', campusId: '',
  nome: '', bloco: '',
  capacidade: 30,
  recursos: [],
  observacoes: ''
})

const idDe = (valor) => (valor && typeof valor === 'object' ? valor._id : valor)

export default {
  name: 'PainelInstitucionalView',
  components: { ConfirmModal },
  data() {
    return {
      abaAtiva: 'universidades',
      abas: [
        { valor: 'universidades', rotulo: 'Universidades' },
        { valor: 'campi', rotulo: 'Campi' },
        { valor: 'departamentos', rotulo: 'Departamentos' },
        { valor: 'cursos', rotulo: 'Cursos' },
        { valor: 'salas', rotulo: 'Salas' }
      ],
      universidades: [],
      campi: [],
      departamentos: [],
      cursos: [],
      salas: [],
      carregando: true,
      erroGeral: null,
      sucesso: null,

      formUni: formUniInicial(),
      formUniAberto: false,
      uniEditandoId: null,
      salvandoUni: false,
      erroUni: null,

      formCampus: formCampusInicial(),
      formCampusAberto: false,
      campusEditandoId: null,
      salvandoCampus: false,
      erroCampus: null,

      formDep: formDepInicial(),
      formDepAberto: false,
      depEditandoId: null,
      salvandoDep: false,
      erroDep: null,

      formCurso: formCursoInicial(),
      formCursoAberto: false,
      cursoEditandoId: null,
      salvandoCurso: false,
      erroCurso: null,

      formSala: formSalaInicial(),
      formSalaAberto: false,
      salaEditandoId: null,
      salvandoSala: false,
      erroSala: null,

      itemParaExcluir: null
    }
  },
  computed: {
    ufs() { return ufsBrasil },
    grausOpcoes() { return grausPermitidos },
    recursosOpcoes() { return recursosPermitidos },
    departamentosDaUniSelecionada() {
      const uniId = this.formCurso.universidadeId
      if (!uniId) return []
      return this.departamentos.filter((d) => idDe(d.universidadeId) === uniId)
    },
    campiDaSalaUniSelecionada() {
      const uniId = this.formSala.universidadeId
      if (!uniId) return []
      return this.campi.filter((c) => idDe(c.universidadeId) === uniId)
    },
    mensagemExclusao() {
      const item = this.itemParaExcluir
      if (!item) return { titulo: '', mensagem: '' }
      const labels = {
        universidade: 'universidade',
        campus: 'campus',
        departamento: 'departamento',
        curso: 'curso',
        sala: 'sala'
      }
      const tipo = labels[item.tipo] || 'item'
      const nome = item.dado?.nome || tipo
      return {
        titulo: `Excluir ${tipo}`,
        mensagem: `Tem certeza que deseja excluir "${nome}"? Essa acao nao pode ser desfeita.`
      }
    }
  },
  async created() {
    await this.carregarTudo()
  },
  methods: {
    async carregarTudo() {
      this.carregando = true
      this.erroGeral = null
      try {
        const [universidades, campi, departamentos, cursos, salas] = await Promise.all([
          universidadeService.listar(),
          campusService.listar(),
          departamentoService.listar(),
          cursoService.listar(),
          salaService.listar()
        ])
        this.universidades = universidades
        this.campi = campi
        this.departamentos = departamentos
        this.cursos = cursos
        this.salas = salas
      } catch (error) {
        this.erroGeral = error.message || 'Erro ao carregar dados institucionais.'
      } finally {
        this.carregando = false
      }
    },
    nomeUniversidadeRef(ref) {
      if (!ref) return ''
      if (typeof ref === 'object') {
        return ref.sigla ? `${ref.sigla} - ${ref.nome}` : ref.nome
      }
      const u = this.universidades.find((x) => x._id === ref)
      return u ? `${u.sigla} - ${u.nome}` : ''
    },
    nomeDepartamentoRef(ref) {
      if (!ref) return ''
      if (typeof ref === 'object') return ref.nome
      const d = this.departamentos.find((x) => x._id === ref)
      return d ? d.nome : ''
    },
    nomeCampusRef(ref) {
      if (!ref) return ''
      if (typeof ref === 'object') return ref.nome
      const c = this.campi.find((x) => x._id === ref)
      return c ? c.nome : ''
    },
    rotuloGrau(grau) {
      return grausPermitidos.find((g) => g.valor === grau)?.rotulo || grau
    },
    rotuloRecurso(valor) {
      return recursosPermitidos.find((r) => r.valor === valor)?.rotulo || valor
    },

    /* ===== Universidade ===== */
    abrirFormUni() {
      if (this.formUniAberto) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      this.formUni = formUniInicial()
      this.uniEditandoId = null
      this.erroUni = null
      this.formUniAberto = true
    },
    editarUni(u) {
      this.uniEditandoId = u._id
      this.formUni = {
        nome: u.nome || '',
        sigla: u.sigla || '',
        cnpj: u.cnpj || '',
        site: u.site || '',
        logoUrl: u.logoUrl || '',
        cidade: u.cidade || '',
        uf: u.uf || '',
        endereco: u.endereco || '',
        descricao: u.descricao || ''
      }
      this.erroUni = null
      this.formUniAberto = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    fecharFormUni() {
      this.formUniAberto = false
      this.uniEditandoId = null
      this.erroUni = null
    },
    payloadUni() {
      return {
        ...this.formUni,
        sigla: this.formUni.sigla ? this.formUni.sigla.toUpperCase().trim() : '',
        uf: this.formUni.uf ? this.formUni.uf.toUpperCase().trim() : null,
        cnpj: this.formUni.cnpj || null,
        site: this.formUni.site || null,
        logoUrl: this.formUni.logoUrl || null,
        cidade: this.formUni.cidade || null,
        endereco: this.formUni.endereco || null,
        descricao: this.formUni.descricao || null
      }
    },
    async salvarUni() {
      this.salvandoUni = true
      this.erroUni = null
      try {
        if (this.uniEditandoId) {
          await universidadeService.atualizar(this.uniEditandoId, this.payloadUni())
          toastService.success('Universidade atualizada com sucesso.')
        } else {
          await universidadeService.criar(this.payloadUni())
          toastService.success('Universidade cadastrada com sucesso.')
        }
        this.fecharFormUni()
        await this.carregarTudo()
      } catch (error) {
        this.erroUni = error.message || 'Erro ao salvar universidade.'
      } finally {
        this.salvandoUni = false
      }
    },
    pedirExclusaoUni(u) {
      this.itemParaExcluir = { tipo: 'universidade', dado: u }
    },

    /* ===== Campus ===== */
    abrirFormCampus() {
      if (this.formCampusAberto) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      this.formCampus = formCampusInicial()
      this.campusEditandoId = null
      this.erroCampus = null
      this.formCampusAberto = true
    },
    editarCampus(c) {
      this.campusEditandoId = c._id
      this.formCampus = {
        universidadeId: idDe(c.universidadeId) || '',
        nome: c.nome || '',
        sigla: c.sigla || '',
        endereco: c.endereco || '',
        cidade: c.cidade || '',
        uf: c.uf || ''
      }
      this.erroCampus = null
      this.formCampusAberto = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    fecharFormCampus() {
      this.formCampusAberto = false
      this.campusEditandoId = null
      this.erroCampus = null
    },
    payloadCampus() {
      return {
        universidadeId: this.formCampus.universidadeId,
        nome: this.formCampus.nome,
        sigla: this.formCampus.sigla ? this.formCampus.sigla.toUpperCase().trim() : null,
        endereco: this.formCampus.endereco || null,
        cidade: this.formCampus.cidade || null,
        uf: this.formCampus.uf ? this.formCampus.uf.toUpperCase().trim() : null
      }
    },
    async salvarCampus() {
      this.salvandoCampus = true
      this.erroCampus = null
      try {
        if (this.campusEditandoId) {
          await campusService.atualizar(this.campusEditandoId, this.payloadCampus())
          toastService.success('Campus atualizado com sucesso.')
        } else {
          await campusService.criar(this.payloadCampus())
          toastService.success('Campus cadastrado com sucesso.')
        }
        this.fecharFormCampus()
        await this.carregarTudo()
      } catch (error) {
        this.erroCampus = error.message || 'Erro ao salvar campus.'
      } finally {
        this.salvandoCampus = false
      }
    },
    pedirExclusaoCampus(c) {
      this.itemParaExcluir = { tipo: 'campus', dado: c }
    },

    /* ===== Departamento ===== */
    abrirFormDep() {
      if (this.formDepAberto) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      this.formDep = formDepInicial()
      this.depEditandoId = null
      this.erroDep = null
      this.formDepAberto = true
    },
    editarDep(d) {
      this.depEditandoId = d._id
      this.formDep = {
        universidadeId: idDe(d.universidadeId) || '',
        nome: d.nome || '',
        sigla: d.sigla || '',
        descricao: d.descricao || ''
      }
      this.erroDep = null
      this.formDepAberto = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    fecharFormDep() {
      this.formDepAberto = false
      this.depEditandoId = null
      this.erroDep = null
    },
    payloadDep() {
      return {
        universidadeId: this.formDep.universidadeId,
        nome: this.formDep.nome,
        sigla: this.formDep.sigla ? this.formDep.sigla.toUpperCase().trim() : null,
        descricao: this.formDep.descricao || null
      }
    },
    async salvarDep() {
      this.salvandoDep = true
      this.erroDep = null
      try {
        if (this.depEditandoId) {
          await departamentoService.atualizar(this.depEditandoId, this.payloadDep())
          toastService.success('Departamento atualizado com sucesso.')
        } else {
          await departamentoService.criar(this.payloadDep())
          toastService.success('Departamento cadastrado com sucesso.')
        }
        this.fecharFormDep()
        await this.carregarTudo()
      } catch (error) {
        this.erroDep = error.message || 'Erro ao salvar departamento.'
      } finally {
        this.salvandoDep = false
      }
    },
    pedirExclusaoDep(d) {
      this.itemParaExcluir = { tipo: 'departamento', dado: d }
    },

    /* ===== Curso ===== */
    abrirFormCurso() {
      if (this.formCursoAberto) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      this.formCurso = formCursoInicial()
      this.cursoEditandoId = null
      this.erroCurso = null
      this.formCursoAberto = true
    },
    editarCurso(c) {
      this.cursoEditandoId = c._id
      this.formCurso = {
        universidadeId: idDe(c.universidadeId) || '',
        departamentoId: idDe(c.departamentoId) || '',
        nome: c.nome || '',
        grau: c.grau || 'graduacao',
        cargaHorariaTotal: c.cargaHorariaTotal || null,
        duracaoSemestres: c.duracaoSemestres || null,
        descricao: c.descricao || ''
      }
      this.erroCurso = null
      this.formCursoAberto = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    fecharFormCurso() {
      this.formCursoAberto = false
      this.cursoEditandoId = null
      this.erroCurso = null
    },
    payloadCurso() {
      return {
        universidadeId: this.formCurso.universidadeId,
        departamentoId: this.formCurso.departamentoId || null,
        nome: this.formCurso.nome,
        grau: this.formCurso.grau,
        cargaHorariaTotal: this.formCurso.cargaHorariaTotal ? Number(this.formCurso.cargaHorariaTotal) : null,
        duracaoSemestres: this.formCurso.duracaoSemestres ? Number(this.formCurso.duracaoSemestres) : null,
        descricao: this.formCurso.descricao || null
      }
    },
    async salvarCurso() {
      this.salvandoCurso = true
      this.erroCurso = null
      try {
        if (this.cursoEditandoId) {
          await cursoService.atualizar(this.cursoEditandoId, this.payloadCurso())
          toastService.success('Curso atualizado com sucesso.')
        } else {
          await cursoService.criar(this.payloadCurso())
          toastService.success('Curso cadastrado com sucesso.')
        }
        this.fecharFormCurso()
        await this.carregarTudo()
      } catch (error) {
        this.erroCurso = error.message || 'Erro ao salvar curso.'
      } finally {
        this.salvandoCurso = false
      }
    },
    pedirExclusaoCurso(c) {
      this.itemParaExcluir = { tipo: 'curso', dado: c }
    },

    /* ===== Sala ===== */
    abrirFormSala() {
      if (this.formSalaAberto) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      this.formSala = formSalaInicial()
      this.salaEditandoId = null
      this.erroSala = null
      this.formSalaAberto = true
    },
    editarSala(s) {
      this.salaEditandoId = s._id
      this.formSala = {
        universidadeId: idDe(s.universidadeId) || '',
        campusId: idDe(s.campusId) || '',
        nome: s.nome || '',
        bloco: s.bloco || '',
        capacidade: s.capacidade || 30,
        recursos: Array.isArray(s.recursos) ? [...s.recursos] : [],
        observacoes: s.observacoes || ''
      }
      this.erroSala = null
      this.formSalaAberto = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    fecharFormSala() {
      this.formSalaAberto = false
      this.salaEditandoId = null
      this.erroSala = null
    },
    payloadSala() {
      return {
        universidadeId: this.formSala.universidadeId,
        campusId: this.formSala.campusId || null,
        nome: this.formSala.nome,
        bloco: this.formSala.bloco || null,
        capacidade: Number(this.formSala.capacidade),
        recursos: Array.isArray(this.formSala.recursos) ? this.formSala.recursos : [],
        observacoes: this.formSala.observacoes || null
      }
    },
    async salvarSala() {
      this.salvandoSala = true
      this.erroSala = null
      try {
        if (this.salaEditandoId) {
          await salaService.atualizar(this.salaEditandoId, this.payloadSala())
          toastService.success('Sala atualizada com sucesso.')
        } else {
          await salaService.criar(this.payloadSala())
          toastService.success('Sala cadastrada com sucesso.')
        }
        this.fecharFormSala()
        await this.carregarTudo()
      } catch (error) {
        this.erroSala = error.message || 'Erro ao salvar sala.'
      } finally {
        this.salvandoSala = false
      }
    },
    pedirExclusaoSala(s) {
      this.itemParaExcluir = { tipo: 'sala', dado: s }
    },

    /* ===== Exclusao unificada ===== */
    async confirmarExclusao() {
      const item = this.itemParaExcluir
      if (!item) return
      const id = item.dado._id
      try {
        if (item.tipo === 'universidade') await universidadeService.excluir(id)
        else if (item.tipo === 'campus') await campusService.excluir(id)
        else if (item.tipo === 'departamento') await departamentoService.excluir(id)
        else if (item.tipo === 'curso') await cursoService.excluir(id)
        else if (item.tipo === 'sala') await salaService.excluir(id)

        toastService.success('Item removido com sucesso.')
        this.itemParaExcluir = null
        await this.carregarTudo()
      } catch (error) {
        toastService.error(error.message || 'Erro ao excluir item.')
        this.itemParaExcluir = null
      }
    }
  },
  watch: {
    'formCurso.universidadeId'(novoValor, valorAnterior) {
      if (novoValor !== valorAnterior) {
        const depAtualPertence = this.departamentos.some(
          (d) => d._id === this.formCurso.departamentoId && idDe(d.universidadeId) === novoValor
        )
        if (!depAtualPertence) this.formCurso.departamentoId = ''
      }
    },
    'formSala.universidadeId'(novoValor, valorAnterior) {
      if (novoValor !== valorAnterior) {
        const campusOk = this.campi.some(
          (c) => c._id === this.formSala.campusId && idDe(c.universidadeId) === novoValor
        )
        if (!campusOk) this.formSala.campusId = ''
      }
    }
  }
}
</script>

<style scoped>
.tabs-institucional {
  display: flex;
  gap: 4px;
  margin: 0 0 24px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.tab-institucional {
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-subtle);
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  font-family: inherit;
}

.tab-institucional:hover {
  color: var(--color-text);
  background-color: transparent;
}

.tab-institucional.is-ativa {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.card-acoes-topo {
  margin-bottom: 16px;
  justify-content: flex-end;
}

.cards-institucionais {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.institucional-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 18px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--color-border);
  transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
}

.institucional-card:hover {
  border-color: var(--color-primary-soft-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.institucional-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.institucional-card-titulo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.institucional-card-titulo strong {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.institucional-card-titulo span {
  font-size: 13px;
  color: var(--color-text-muted);
}

.institucional-card-corpo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: var(--color-text);
}

.institucional-card-corpo .texto-suave {
  color: var(--color-text-subtle);
  font-size: 13px;
}

.link-suave {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 13px;
  word-break: break-all;
}

.link-suave:hover {
  text-decoration: underline;
}

.checkbox-lista-grid {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.checkbox-opcao-compact {
  padding: 8px 12px;
}
</style>
