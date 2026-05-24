const Categoria = require('../models/Categoria');
const Sala = require('../models/Sala');
const Palestrante = require('../models/Palestrante');
const Evento = require('../models/Evento');
const Atividade = require('../models/Atividade');
const Inscricao = require('../models/Inscricao');
const Certificado = require('../models/Certificado');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Universidade = require('../models/Universidade');
const Campus = require('../models/Campus');
const generateValidationCode = require('../utils/generateValidationCode');

const upsert = async (Model, filter, payload) => {
  const existing = await Model.findOne(filter);
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Model.create(payload);
};

const seedAllControllers = async () => {
  if (process.env.SEED_ALL_CONTROLLERS === 'false') {
    console.log('Seed completo de controllers desativado.');
    return;
  }

  // tente usar a universidade UNIFEI criada pelo seedDefaultInstitutions
  const universidade = await Universidade.findOne({ sigla: 'UNIFEI' }) || (await Universidade.findOne());
  const campus = universidade ? await Campus.findOne({ universidadeId: universidade._id }) : null;

  // usuarios previstos pelo seedDefaultUsers
  const organizador = await User.findOne({ email: process.env.SEED_ORGANIZADOR_EMAIL || 'organizador@unievent.com' });
  const participante = await User.findOne({ email: process.env.SEED_PARTICIPANTE_EMAIL || 'participante@unievent.com' });

  // Categorias
  const categorias = [
    { nome: 'Tecnologia', descricao: 'Eventos relacionados a tecnologia e inovacao' },
    { nome: 'Ciencia', descricao: 'Palestras e mesas sobre ciencias' },
    { nome: 'Arte', descricao: 'Workshops e exposicoes de artes' }
  ];

  const categoriaObjs = {};
  for (const cat of categorias) {
    const c = await upsert(Categoria, { nome: cat.nome }, cat);
    categoriaObjs[cat.nome] = c._id;
  }

  // Salas
  const defaultSalas = [];
  if (universidade && campus) {
    defaultSalas.push({ universidadeId: universidade._id, campusId: campus._id, nome: 'Auditorio Principal', capacidade: 200, recursos: ['projetor', 'sistema_som', 'wifi'] });
    defaultSalas.push({ universidadeId: universidade._id, campusId: campus._id, nome: 'Laboratorio A', capacidade: 40, recursos: ['computadores', 'wifi'] });
  }

  const salaObjs = [];
  for (const s of defaultSalas) {
    const sala = await upsert(Sala, { universidadeId: s.universidadeId, campusId: s.campusId, nome: s.nome }, s);
    salaObjs.push(sala);
  }

  // Palestrantes
  const defaultPalestrantes = [
    { nome: 'Dr. Ana Souza', email: 'ana.souza@exemplo.com', areaAtuacao: 'Inteligencia Artificial', instituicao: 'UNIFEI' },
    { nome: 'Prof. Carlos Lima', email: 'carlos.lima@exemplo.com', areaAtuacao: 'Sistemas Distribuidos', instituicao: 'UNIFEI' }
  ];

  const palestranteObjs = [];
  for (const p of defaultPalestrantes) {
    const pal = await upsert(Palestrante, { email: p.email }, { ...p, universidadeId: universidade ? universidade._id : null });
    palestranteObjs.push(pal);
  }

  // Evento exemplo
  const eventDate = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  const eventoPayload = {
    titulo: 'Semana de Tecnologia UNIFEI',
    descricao: 'Evento anual com palestras, workshops e minicursos sobre tecnologia.',
    data: eventDate,
    horarioInicio: '09:00',
    horarioFim: '18:00',
    local: campus ? campus.nome : 'Campus',
    cidade: universidade ? universidade.cidade : null,
    uf: universidade ? universidade.uf : null,
    cargaHoraria: 8,
    vagas: 150,
    categoriaId: categoriaObjs['Tecnologia'],
    universidadeId: universidade ? universidade._id : null,
    campusId: campus ? campus._id : null,
    palestrantes: palestranteObjs.map((p) => p._id),
    organizadorId: organizador ? organizador._id : null,
    status: 'aberto',
    permiteCertificado: true
  };

  const evento = await upsert(Evento, { titulo: eventoPayload.titulo }, eventoPayload);

  // Atividades
  const inicio1 = new Date(evento.data);
  inicio1.setHours(9, 0, 0, 0);
  const fim1 = new Date(inicio1);
  fim1.setHours(10, 30, 0, 0);

  const atividade1 = await upsert(
    Atividade,
    { eventoId: evento._id, titulo: 'Abertura e palestra principal' },
    {
      eventoId: evento._id,
      titulo: 'Abertura e palestra principal',
      descricao: 'Palestra de abertura sobre tendencias em tecnologia.',
      tipo: 'palestra',
      inicio: inicio1,
      fim: fim1,
      salaId: salaObjs[0] ? salaObjs[0]._id : null,
      palestrantes: [palestranteObjs[0] ? palestranteObjs[0]._id : null],
      cargaHoraria: 1.5
    }
  );

  // Inscricao do participante
  if (participante) {
    await upsert(Inscricao, { usuarioId: participante._id, eventoId: evento._id }, { usuarioId: participante._id, eventoId: evento._id });

    // Certificado
    const codigo = generateValidationCode();
    await upsert(Certificado, { usuarioId: participante._id, eventoId: evento._id }, { usuarioId: participante._id, eventoId: evento._id, codigoValidacao: codigo, cargaHoraria: evento.cargaHoraria });

    // Feedback de exemplo
    await upsert(Feedback, { usuarioId: participante._id, eventoId: evento._id }, { usuarioId: participante._id, eventoId: evento._id, nota: 5, comentario: 'Excelente evento de teste.' });
  }

  // Evento encerrado com feedbacks variados para demonstracao da IA
  const eventoFeedbackDate = new Date(Date.now() - 14 * 24 * 3600 * 1000);
  eventoFeedbackDate.setHours(0, 0, 0, 0);

  const eventoFeedbackPayload = {
    titulo: 'Workshop de Inovacao Academica',
    descricao: 'Evento encerrado usado para demonstrar resumo de feedbacks por IA, com avaliacoes reais de participantes.',
    data: eventoFeedbackDate,
    horarioInicio: '14:00',
    horarioFim: '18:00',
    local: salaObjs[0] ? salaObjs[0].nome : (campus ? campus.nome : 'Auditorio'),
    cidade: universidade ? universidade.cidade : null,
    uf: universidade ? universidade.uf : null,
    cargaHoraria: 4,
    vagas: 40,
    categoriaId: categoriaObjs['Tecnologia'],
    universidadeId: universidade ? universidade._id : null,
    campusId: campus ? campus._id : null,
    palestrantes: palestranteObjs.map((p) => p._id),
    organizadorId: organizador ? organizador._id : null,
    status: 'fechado',
    permiteCertificado: true
  };

  const eventoFeedback = await upsert(Evento, { titulo: eventoFeedbackPayload.titulo }, eventoFeedbackPayload);

  const inicioFeedback = new Date(eventoFeedback.data);
  inicioFeedback.setHours(14, 0, 0, 0);
  const fimFeedback = new Date(eventoFeedback.data);
  fimFeedback.setHours(18, 0, 0, 0);

  await upsert(
    Atividade,
    { eventoId: eventoFeedback._id, titulo: 'Design de solucoes para desafios universitarios' },
    {
      eventoId: eventoFeedback._id,
      titulo: 'Design de solucoes para desafios universitarios',
      descricao: 'Dinamica pratica para idear, prototipar e apresentar melhorias para o ambiente academico.',
      tipo: 'workshop',
      inicio: inicioFeedback,
      fim: fimFeedback,
      salaId: salaObjs[0] ? salaObjs[0]._id : null,
      palestrantes: [palestranteObjs[0] ? palestranteObjs[0]._id : null].filter(Boolean),
      cargaHoraria: 4
    }
  );

  const participantesDemo = [
    {
      nome: 'Mariana Costa',
      email: 'mariana.costa.demo@unievent.com',
      curso: 'Ciencia da Computacao',
      ra: 'DEMO001',
      nota: 5,
      comentario: 'Workshop muito bem organizado, com exemplos praticos e dinamica envolvente. Sai com ideias aplicaveis ao meu projeto.'
    },
    {
      nome: 'Lucas Ferreira',
      email: 'lucas.ferreira.demo@unievent.com',
      curso: 'Engenharia de Computacao',
      ra: 'DEMO002',
      nota: 5,
      comentario: 'Conteudo excelente e palestrantes muito preparados. A parte pratica ajudou bastante a fixar os conceitos.'
    },
    {
      nome: 'Beatriz Almeida',
      email: 'beatriz.almeida.demo@unievent.com',
      curso: 'Sistemas de Informacao',
      ra: 'DEMO003',
      nota: 4,
      comentario: 'Gostei muito da proposta e da interacao entre os grupos. Apenas senti falta de um pouco mais de tempo para perguntas.'
    },
    {
      nome: 'Rafael Martins',
      email: 'rafael.martins.demo@unievent.com',
      curso: 'Administracao',
      ra: 'DEMO004',
      nota: 5,
      comentario: 'Evento inspirador, com linguagem acessivel e exemplos conectados com problemas reais da universidade.'
    },
    {
      nome: 'Camila Rocha',
      email: 'camila.rocha.demo@unievent.com',
      curso: 'Engenharia de Producao',
      ra: 'DEMO005',
      nota: 4,
      comentario: 'A metodologia foi muito boa e os materiais de apoio estavam claros. Poderia ter mais casos de estudo.'
    },
    {
      nome: 'Gustavo Lima',
      email: 'gustavo.lima.demo@unievent.com',
      curso: 'Ciencia da Computacao',
      ra: 'DEMO006',
      nota: 5,
      comentario: 'A organizacao foi otima, o horario foi respeitado e a atividade em equipe tornou o conteudo mais interessante.'
    },
    {
      nome: 'Fernanda Ribeiro',
      email: 'fernanda.ribeiro.demo@unievent.com',
      curso: 'Design',
      ra: 'DEMO007',
      nota: 5,
      comentario: 'Adorei a experiencia. O workshop estimulou criatividade, colaboracao e trouxe ferramentas uteis para projetos academicos.'
    },
    {
      nome: 'Pedro Henrique',
      email: 'pedro.henrique.demo@unievent.com',
      curso: 'Engenharia Eletrica',
      ra: 'DEMO008',
      nota: 4,
      comentario: 'Evento positivo e bem conduzido. A sala estava adequada, mas a conexao com a internet oscilou em alguns momentos.'
    },
    {
      nome: 'Juliana Nunes',
      email: 'juliana.nunes.demo@unievent.com',
      curso: 'Pedagogia',
      ra: 'DEMO009',
      nota: 5,
      comentario: 'A abordagem foi acolhedora e muito didatica. Foi facil participar mesmo sem experiencia previa no tema.'
    },
    {
      nome: 'Andre Carvalho',
      email: 'andre.carvalho.demo@unievent.com',
      curso: 'Matematica',
      ra: 'DEMO010',
      nota: 3,
      comentario: 'O conteudo foi bom e relevante, mas algumas atividades poderiam ter instrucoes mais objetivas para ganhar ritmo.'
    }
  ];

  for (const participanteDemo of participantesDemo) {
    const usuarioDemo = await upsert(
      User,
      { email: participanteDemo.email },
      {
        nome: participanteDemo.nome,
        email: participanteDemo.email,
        senha: process.env.SEED_USER_PASSWORD || '123456',
        tipoPerfil: 'participante',
        curso: participanteDemo.curso,
        ra: participanteDemo.ra,
        universidadeId: universidade ? universidade._id : null,
        ativo: true
      }
    );

    await upsert(
      Inscricao,
      { usuarioId: usuarioDemo._id, eventoId: eventoFeedback._id },
      {
        usuarioId: usuarioDemo._id,
        eventoId: eventoFeedback._id,
        status: 'participante',
        presencaConfirmada: true
      }
    );

    await upsert(
      Feedback,
      { usuarioId: usuarioDemo._id, eventoId: eventoFeedback._id },
      {
        usuarioId: usuarioDemo._id,
        eventoId: eventoFeedback._id,
        nota: participanteDemo.nota,
        comentario: participanteDemo.comentario
      }
    );
  }

  console.log('Seeds para controllers principais aplicados: categorias, salas, palestrantes, evento, atividades, inscricao, certificado, feedback.');
};

module.exports = seedAllControllers;
