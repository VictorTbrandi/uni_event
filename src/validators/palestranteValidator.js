const { body } = require('express-validator');

const palestranteValidator = [
  body('nome').trim().isLength({ min: 3, max: 120 }).withMessage('Nome deve ter entre 3 e 120 caracteres.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('biografia').optional().isLength({ max: 1000 }).withMessage('Biografia deve ter no máximo 1000 caracteres.'),
  body('areaAtuacao').optional().isLength({ max: 120 }).withMessage('Área de atuação deve ter no máximo 120 caracteres.'),
  body('instituicao').optional().isLength({ max: 120 }).withMessage('Instituição deve ter no máximo 120 caracteres.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { palestranteValidator };
