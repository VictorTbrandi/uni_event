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

  console.log('Seeds para controllers principais aplicados: categorias, salas, palestrantes, evento, atividades, inscricao, certificado, feedback.');
};

module.exports = seedAllControllers;
