const Universidade = require('../models/Universidade');
const Campus = require('../models/Campus');
const Departamento = require('../models/Departamento');
const Curso = require('../models/Curso');

const defaultUniversidades = [
  {
    sigla: 'UNIFEI',
    payload: {
      nome: 'Universidade Federal de Itajuba',
      sigla: 'UNIFEI',
      cidade: 'Itajuba',
      uf: 'MG',
      site: 'https://unifei.edu.br',
      descricao: 'Universidade publica federal com foco em engenharia e tecnologia.'
    },
    campi: [
      { nome: 'Campus Itajuba', sigla: 'ITJ', cidade: 'Itajuba', uf: 'MG' },
      { nome: 'Campus Itabira', sigla: 'ITA', cidade: 'Itabira', uf: 'MG' }
    ],
    departamentos: [
      { nome: 'Instituto de Engenharia de Sistemas e Tecnologia da Informacao', sigla: 'IESTI' },
      { nome: 'Instituto de Engenharia Mecanica', sigla: 'IEM' }
    ],
    cursos: [
      { nome: 'Ciencia da Computacao', grau: 'graduacao', departamento: 'IESTI', cargaHorariaTotal: 3600, duracaoSemestres: 8 },
      { nome: 'Sistemas de Informacao', grau: 'graduacao', departamento: 'IESTI', cargaHorariaTotal: 3200, duracaoSemestres: 8 },
      { nome: 'Engenharia Mecanica', grau: 'graduacao', departamento: 'IEM', cargaHorariaTotal: 4000, duracaoSemestres: 10 }
    ]
  },
  {
    sigla: 'USP',
    payload: {
      nome: 'Universidade de Sao Paulo',
      sigla: 'USP',
      cidade: 'Sao Paulo',
      uf: 'SP',
      site: 'https://usp.br',
      descricao: 'Maior universidade publica do Brasil, com diversas unidades pelo estado.'
    },
    campi: [
      { nome: 'Campus Butanta', sigla: 'BUT', cidade: 'Sao Paulo', uf: 'SP' },
      { nome: 'Campus Sao Carlos', sigla: 'SCA', cidade: 'Sao Carlos', uf: 'SP' }
    ],
    departamentos: [
      { nome: 'Instituto de Ciencias Matematicas e de Computacao', sigla: 'ICMC' }
    ],
    cursos: [
      { nome: 'Bacharelado em Ciencia da Computacao', grau: 'graduacao', departamento: 'ICMC', cargaHorariaTotal: 3600, duracaoSemestres: 8 },
      { nome: 'Mestrado em Ciencias de Computacao e Matematica Computacional', grau: 'mestrado', departamento: 'ICMC', cargaHorariaTotal: 1800 }
    ]
  }
];

const upsert = async (Model, filter, payload) => {
  const existing = await Model.findOne(filter);
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Model.create(payload);
};

const seedDefaultInstitutions = async () => {
  if (process.env.SEED_DEFAULT_INSTITUTIONS === 'false') {
    console.log('Seed de instituicoes padrao desativado.');
    return;
  }

  for (const item of defaultUniversidades) {
    const universidade = await upsert(Universidade, { sigla: item.sigla }, item.payload);

    const departamentosCriados = {};
    for (const dep of item.departamentos) {
      const departamento = await upsert(
        Departamento,
        { universidadeId: universidade._id, nome: dep.nome },
        { ...dep, universidadeId: universidade._id }
      );
      if (dep.sigla) departamentosCriados[dep.sigla] = departamento._id;
    }

    for (const campus of item.campi) {
      await upsert(
        Campus,
        { universidadeId: universidade._id, nome: campus.nome },
        { ...campus, universidadeId: universidade._id }
      );
    }

    for (const curso of item.cursos) {
      const { departamento, ...rest } = curso;
      const departamentoId = departamento ? departamentosCriados[departamento] || null : null;

      await upsert(
        Curso,
        { universidadeId: universidade._id, nome: rest.nome },
        { ...rest, universidadeId: universidade._id, departamentoId }
      );
    }
  }

  console.log(`Instituicoes padrao garantidas: ${defaultUniversidades.map((u) => u.sigla).join(', ')}`);
};

module.exports = seedDefaultInstitutions;
