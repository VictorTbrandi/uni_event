const { body } = require('express-validator');
const { tiposPermitidos } = require('../models/Atividade');

const atividadeValidator = [
  body('eventoId').isMongoId().withMessage('Evento invalido.'),
  body('titulo').trim().isLength({ min: 3, max: 180 }).withMessage('Titulo deve ter entre 3 e 180 caracteres.'),
  body('descricao').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 1500 }).withMessage('Descricao deve ter no maximo 1500 caracteres.'),
  body('tipo').isIn(tiposPermitidos).withMessage('Tipo invalido.'),
  body('inicio').isISO8601().withMessage('Data/hora de inicio invalida.'),
  body('fim').isISO8601().withMessage('Data/hora de fim invalida.'),
  body('salaId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Sala invalida.'),
  body('salaTexto').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Sala (texto) deve ter no maximo 120 caracteres.'),
  body('palestrantes').optional().isArray().withMessage('Palestrantes deve ser um array.'),
  body('palestrantes.*').optional().isMongoId().withMessage('Palestrante invalido.'),
  body('cargaHoraria').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Carga horaria deve ser maior ou igual a zero.'),
  body('capacidadeMax').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Capacidade maxima deve ser maior que zero.'),
  body('ordem').optional({ nullable: true }).isInt().withMessage('Ordem deve ser um numero inteiro.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { atividadeValidator };
