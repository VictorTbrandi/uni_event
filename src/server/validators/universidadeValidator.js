const { body } = require('express-validator');

const universidadeValidator = [
  body('nome').trim().isLength({ min: 3, max: 150 }).withMessage('Nome deve ter entre 3 e 150 caracteres.'),
  body('sigla').trim().isLength({ min: 2, max: 20 }).withMessage('Sigla deve ter entre 2 e 20 caracteres.'),
  body('cnpj').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 18 }).withMessage('CNPJ deve ter no maximo 18 caracteres.'),
  body('site').optional({ nullable: true, checkFalsy: true }).trim().isURL().withMessage('Site deve ser uma URL valida.'),
  body('logoUrl').optional({ nullable: true, checkFalsy: true }).trim().isURL().withMessage('Logo deve ser uma URL valida.'),
  body('cidade').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Cidade deve ter no maximo 120 caracteres.'),
  body('uf').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres.'),
  body('endereco').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 250 }).withMessage('Endereco deve ter no maximo 250 caracteres.'),
  body('descricao').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Descricao deve ter no maximo 1000 caracteres.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano.')
];

module.exports = { universidadeValidator };
