const { body } = require('express-validator');

const eventoValidator = [
  body('titulo').trim().isLength({ min: 5, max: 150 }).withMessage('Título deve ter entre 5 e 150 caracteres.'),
  body('descricao').trim().isLength({ min: 10, max: 2000 }).withMessage('Descrição deve ter entre 10 e 2000 caracteres.'),
  body('data').isISO8601().withMessage('Data inválida.'),
  body('horarioInicio').notEmpty().withMessage('Horário de início é obrigatório.'),
  body('horarioFim').notEmpty().withMessage('Horário de fim é obrigatório.'),
  body('local').trim().isLength({ min: 3, max: 150 }).withMessage('Local deve ter entre 3 e 150 caracteres.'),
  body('cargaHoraria').isInt({ min: 1 }).withMessage('Carga horária deve ser maior que zero.'),
  body('vagas').isInt({ min: 1 }).withMessage('Vagas deve ser maior que zero.'),
  body('categoriaId').isMongoId().withMessage('Categoria inválida.'),
  body('palestrantes').optional().isArray().withMessage('Palestrantes deve ser um array.'),
  body('status').optional().isIn(['rascunho', 'aberto', 'encerrado', 'cancelado']).withMessage('Status inválido.'),
  body('permiteCertificado').optional().isBoolean().withMessage('PermiteCertificado deve ser booleano.')
];

module.exports = { eventoValidator };
