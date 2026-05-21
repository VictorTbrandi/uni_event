const { body } = require('express-validator');

const chatValidator = [
  body('mensagem').trim().isLength({ min: 1, max: 800 }).withMessage('Mensagem invalida.'),
  body('historico').optional().isArray({ max: 12 }).withMessage('Historico invalido.'),
  body('historico.*.autor').optional().isIn(['usuario', 'ia']).withMessage('Autor do historico invalido.'),
  body('historico.*.texto').optional().isString().isLength({ max: 1000 }).withMessage('Texto do historico invalido.')
];

const resumirFeedbacksValidator = [
  body('eventoId').isMongoId().withMessage('Evento inválido.')
];

const classificarSatisfacaoValidator = [
  body('eventoId').isMongoId().withMessage('Evento inválido.')
];

const sugerirDescricaoValidator = [
  body('titulo').trim().isLength({ min: 3, max: 150 }).withMessage('Título inválido.'),
  body('categoria').trim().notEmpty().withMessage('Categoria é obrigatória.'),
  body('palestrante').trim().notEmpty().withMessage('Palestrante é obrigatório.')
];

module.exports = {
  chatValidator,
  resumirFeedbacksValidator,
  classificarSatisfacaoValidator,
  sugerirDescricaoValidator
};
