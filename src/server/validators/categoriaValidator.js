const { body } = require('express-validator');

const categoriaValidator = [
  body('nome').trim().isLength({ min: 2, max: 80 }).withMessage('Nome deve ter entre 2 e 80 caracteres.'),
  body('descricao').optional().isLength({ max: 300 }).withMessage('Descrição deve ter no máximo 300 caracteres.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { categoriaValidator };
