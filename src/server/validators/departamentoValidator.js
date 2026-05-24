const { body } = require('express-validator');

const departamentoValidator = [
  body('universidadeId').isMongoId().withMessage('Universidade invalida.'),
  body('nome').trim().isLength({ min: 2, max: 150 }).withMessage('Nome deve ter entre 2 e 150 caracteres.'),
  body('sigla').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Sigla deve ter no maximo 20 caracteres.'),
  body('descricao').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Descricao deve ter no maximo 500 caracteres.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { departamentoValidator };
