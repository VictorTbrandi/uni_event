const { body } = require('express-validator');

const registerValidator = [
  body('nome').trim().isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
  body('tipoPerfil').optional().isIn(['admin', 'organizador', 'participante']).withMessage('Perfil inválido.')
];

const loginValidator = [
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('senha').notEmpty().withMessage('Senha é obrigatória.')
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('E-mail inválido.')
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Token é obrigatório.'),
  body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres.')
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
