const express = require('express');
const inscricaoController = require('../controllers/inscricaoController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { createInscricaoValidator } = require('../validators/inscricaoValidator');

const router = express.Router();

router.use(authMiddleware);

router.post('/', authorize('participante', 'admin'), createInscricaoValidator, validateRequest, asyncHandler(inscricaoController.create.bind(inscricaoController)));
router.patch('/:id/cancelar', authorize('participante', 'admin'), asyncHandler(inscricaoController.cancel.bind(inscricaoController)));
router.get('/minhas', authorize('participante', 'admin'), asyncHandler(inscricaoController.getMine.bind(inscricaoController)));

module.exports = router;
