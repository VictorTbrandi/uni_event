const { body } = require('express-validator');

const createUserValidator = [
  body('nome').trim().isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
  body('tipoPerfil').isIn(['admin', 'organizador', 'participante']).withMessage('Perfil inválido.'),
  body('curso').optional().isLength({ max: 100 }).withMessage('Curso deve ter no máximo 100 caracteres.'),
  body('ra').optional().isLength({ max: 30 }).withMessage('RA deve ter no máximo 30 caracteres.')
];

const updateUserValidator = [
  body('nome').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres.'),
  body('email').optional().isEmail().withMessage('E-mail inválido.'),
  body('tipoPerfil').optional().isIn(['admin', 'organizador', 'participante']).withMessage('Perfil inválido.'),
  body('curso').optional().isLength({ max: 100 }).withMessage('Curso deve ter no máximo 100 caracteres.'),
  body('ra').optional().isLength({ max: 30 }).withMessage('RA deve ter no máximo 30 caracteres.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { createUserValidator, updateUserValidator };
