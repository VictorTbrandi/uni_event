const { body } = require('express-validator');

const feedbackValidator = [
  body('eventoId').isMongoId().withMessage('Evento inválido.'),
  body('nota').isInt({ min: 1, max: 5 }).withMessage('Nota deve ser de 1 a 5.'),
  body('comentario').optional().isLength({ max: 1000 }).withMessage('Comentário deve ter no máximo 1000 caracteres.')
];

module.exports = { feedbackValidator };
