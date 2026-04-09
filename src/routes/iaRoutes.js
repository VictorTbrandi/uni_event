const express = require('express');
const iaController = require('../controllers/iaController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  resumirFeedbacksValidator,
  classificarSatisfacaoValidator,
  sugerirDescricaoValidator
} = require('../validators/iaValidator');

const router = express.Router();

router.use(authMiddleware);

router.post('/resumir-feedbacks', authorize('admin', 'organizador'), resumirFeedbacksValidator, validateRequest, asyncHandler(iaController.resumirFeedbacks.bind(iaController)));
router.post('/classificar-satisfacao', authorize('admin', 'organizador'), classificarSatisfacaoValidator, validateRequest, asyncHandler(iaController.classificarSatisfacao.bind(iaController)));
router.post('/sugerir-descricao-evento', authorize('admin', 'organizador'), sugerirDescricaoValidator, validateRequest, asyncHandler(iaController.sugerirDescricaoEvento.bind(iaController)));

module.exports = router;
