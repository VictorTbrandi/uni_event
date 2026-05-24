const { body } = require('express-validator');
const { grausPermitidos } = require('../models/Curso');

const cursoValidator = [
  body('universidadeId').isMongoId().withMessage('Universidade invalida.'),
  body('departamentoId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Departamento invalido.'),
  body('nome').trim().isLength({ min: 2, max: 150 }).withMessage('Nome deve ter entre 2 e 150 caracteres.'),
  body('grau').isIn(grausPermitidos).withMessage('Grau invalido.'),
  body('cargaHorariaTotal').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Carga horaria total deve ser maior que zero.'),
  body('duracaoSemestres').optional({ nullable: true }).isInt({ min: 1, max: 20 }).withMessage('Duracao em semestres deve estar entre 1 e 20.'),
  body('coordenadorId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Coordenador invalido.'),
  body('descricao').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Descricao deve ter no maximo 1000 caracteres.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { cursoValidator };
