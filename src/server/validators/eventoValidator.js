const { body } = require('express-validator');

const eventoValidator = [
  body('titulo').trim().isLength({ min: 5, max: 150 }).withMessage('Titulo deve ter entre 5 e 150 caracteres.'),
  body('descricao').trim().isLength({ min: 10, max: 2000 }).withMessage('Descricao deve ter entre 10 e 2000 caracteres.'),
  body('data').isISO8601().withMessage('Data invalida.'),
  body('horarioInicio').notEmpty().withMessage('Horario de inicio e obrigatorio.'),
  body('horarioFim').notEmpty().withMessage('Horario de fim e obrigatorio.'),
  body('local').trim().isLength({ min: 3, max: 150 }).withMessage('Local deve ter entre 3 e 150 caracteres.'),
  body('previsaoTempoAtiva').optional().isBoolean().withMessage('PrevisaoTempoAtiva deve ser booleano.'),
  body('cidade')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Cidade deve ter entre 2 e 120 caracteres.'),
  body('uf')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('UF deve ter 2 caracteres.'),
  body('cargaHoraria').isInt({ min: 1 }).withMessage('Carga horaria deve ser maior que zero.'),
  body('vagas').isInt({ min: 1 }).withMessage('Vagas deve ser maior que zero.'),
  body('inscricoesEncerramEm').optional({ nullable: true }).isISO8601().withMessage('Encerramento das inscricoes invalido.'),
  body('categoriaId').isMongoId().withMessage('Categoria invalida.'),
  body('palestrantes').optional().isArray().withMessage('Palestrantes deve ser um array.'),
  body('status').optional().isIn(['aberto', 'fechado', 'encerrado', 'cancelado']).withMessage('Status invalido.'),
  body('permiteCertificado').optional().isBoolean().withMessage('PermiteCertificado deve ser booleano.')
];

module.exports = { eventoValidator };
