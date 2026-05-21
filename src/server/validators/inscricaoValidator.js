const { body } = require('express-validator');

const createInscricaoValidator = [
  body('eventoId').isMongoId().withMessage('Evento inválido.')
];

module.exports = { createInscricaoValidator };
