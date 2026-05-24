const { body } = require('express-validator');

const palestranteValidator = [
  body('nome').trim().isLength({ min: 3, max: 120 }).withMessage('Nome deve ter entre 3 e 120 caracteres.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('biografia').optional().isLength({ max: 1000 }).withMessage('Biografia deve ter no máximo 1000 caracteres.'),
  body('areaAtuacao').optional().isLength({ max: 120 }).withMessage('Área de atuação deve ter no máximo 120 caracteres.'),
  body('instituicao').optional().isLength({ max: 120 }).withMessage('Instituição deve ter no máximo 120 caracteres.'),
  body('universidadeId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Universidade inválida.'),
  body('titulacao').optional({ nullable: true, checkFalsy: true }).isIn(['graduado', 'especialista', 'mestre', 'doutor', 'pos_doutor']).withMessage('Titulação inválida.'),
  body('lattes').optional({ checkFalsy: true }).isURL().withMessage('Lattes deve ser um link válido.'),
  body('linkedin').optional({ checkFalsy: true }).isURL().withMessage('LinkedIn deve ser um link válido.'),
  body('fotoUrl').optional({ checkFalsy: true }).isURL().withMessage('Foto URL deve ser um link valido.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { palestranteValidator };
