const { body } = require('express-validator');

const emitirCertificadoValidator = [
  body('usuarioId').isMongoId().withMessage('Usuário inválido.'),
  body('eventoId').isMongoId().withMessage('Evento inválido.'),
  body('urlArquivo').optional().isURL().withMessage('URL do arquivo inválida.')
];

module.exports = { emitirCertificadoValidator };
