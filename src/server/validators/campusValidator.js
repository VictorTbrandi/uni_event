const { body } = require('express-validator');

const campusValidator = [
  body('universidadeId').isMongoId().withMessage('Universidade invalida.'),
  body('nome').trim().isLength({ min: 2, max: 120 }).withMessage('Nome deve ter entre 2 e 120 caracteres.'),
  body('sigla').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Sigla deve ter no maximo 20 caracteres.'),
  body('endereco').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 250 }).withMessage('Endereco deve ter no maximo 250 caracteres.'),
  body('cidade').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Cidade deve ter no maximo 120 caracteres.'),
  body('uf').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres.'),
  body('latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }).withMessage('Latitude invalida.'),
  body('longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }).withMessage('Longitude invalida.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { campusValidator };
