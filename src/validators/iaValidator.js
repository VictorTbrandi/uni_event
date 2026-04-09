const { body } = require('express-validator');

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
  resumirFeedbacksValidator,
  classificarSatisfacaoValidator,
  sugerirDescricaoValidator
};
