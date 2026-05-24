const { body } = require('express-validator');
const { recursosPermitidos } = require('../models/Sala');

const salaValidator = [
  body('universidadeId').isMongoId().withMessage('Universidade invalida.'),
  body('campusId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Campus invalido.'),
  body('nome').trim().isLength({ min: 2, max: 120 }).withMessage('Nome deve ter entre 2 e 120 caracteres.'),
  body('bloco').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 40 }).withMessage('Bloco deve ter no maximo 40 caracteres.'),
  body('capacidade').isInt({ min: 1 }).withMessage('Capacidade deve ser maior que zero.'),
  body('recursos').optional().isArray().withMessage('Recursos deve ser um array.'),
  body('recursos.*').optional().isIn(recursosPermitidos).withMessage('Recurso invalido.'),
  body('observacoes').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Observacoes deve ter no maximo 500 caracteres.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { salaValidator };
