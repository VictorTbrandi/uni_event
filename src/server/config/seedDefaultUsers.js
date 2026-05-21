const User = require('../models/User');

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD || '123456';

const defaultUsers = [
  {
    nome: 'Administrador UniEvent',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@unievent.com',
    tipoPerfil: 'admin',
    curso: 'Administracao do sistema',
    ra: 'ADMIN001'
  },
  {
    nome: 'Organizador UniEvent',
    email: process.env.SEED_ORGANIZADOR_EMAIL || 'organizador@unievent.com',
    tipoPerfil: 'organizador',
    curso: 'Organizacao de eventos',
    ra: 'ORG001'
  },
  {
    nome: 'Participante UniEvent',
    email: process.env.SEED_PARTICIPANTE_EMAIL || 'participante@unievent.com',
    tipoPerfil: 'participante',
    curso: 'Ciencia da Computacao',
    ra: 'PART001'
  }
];

const seedDefaultUsers = async () => {
  if (process.env.SEED_DEFAULT_USERS === 'false') {
    console.log('Seed de usuarios padrao desativado.');
    return;
  }

  for (const payload of defaultUsers) {
    const user = await User.findOne({ email: payload.email }).select('+senha');

    if (user) {
      user.nome = payload.nome;
      user.tipoPerfil = payload.tipoPerfil;
      user.curso = payload.curso;
      user.ra = payload.ra;
      user.ativo = true;
      user.senha = DEFAULT_PASSWORD;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      continue;
    }

    await User.create({
      ...payload,
      senha: DEFAULT_PASSWORD,
      ativo: true
    });
  }

  console.log('Usuarios padrao garantidos:');
  defaultUsers.forEach((user) => {
    console.log(`- ${user.tipoPerfil}: ${user.email} / senha ${DEFAULT_PASSWORD}`);
  });
};

module.exports = seedDefaultUsers;
