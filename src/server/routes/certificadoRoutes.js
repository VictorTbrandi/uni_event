const express = require('express');
const certificadoController = require('../controllers/certificadoController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { emitirCertificadoValidator } = require('../validators/certificadoValidator');

const router = express.Router();

router.use(authMiddleware);

router.post('/emitir', authorize('admin', 'organizador'), emitirCertificadoValidator, validateRequest, asyncHandler(certificadoController.emitir.bind(certificadoController)));
router.get('/meus', authorize('participante', 'admin', 'organizador'), asyncHandler(certificadoController.getMine.bind(certificadoController)));
router.get('/:id', authorize('participante', 'admin', 'organizador'), asyncHandler(certificadoController.findById.bind(certificadoController)));

module.exports = router;
