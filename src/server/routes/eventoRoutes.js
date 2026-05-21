const express = require('express');
const eventoController = require('../controllers/eventoController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { eventoValidator } = require('../validators/eventoValidator');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

router.get('/', asyncHandler(eventoController.findAll.bind(eventoController)));
router.get('/:id', asyncHandler(eventoController.findById.bind(eventoController)));
router.get('/:id/participantes', authMiddleware, authorize('admin', 'organizador'), asyncHandler(eventoController.getParticipants.bind(eventoController)));
router.get('/:id/feedbacks', authMiddleware, authorize('admin', 'organizador'), asyncHandler(feedbackController.getByEvent.bind(feedbackController)));
router.post('/', authMiddleware, authorize('admin', 'organizador'), eventoValidator, validateRequest, asyncHandler(eventoController.create.bind(eventoController)));
router.put('/:id', authMiddleware, authorize('admin', 'organizador'), eventoValidator, validateRequest, asyncHandler(eventoController.update.bind(eventoController)));
router.delete('/:id', authMiddleware, authorize('admin', 'organizador'), asyncHandler(eventoController.delete.bind(eventoController)));

module.exports = router;
