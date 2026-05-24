const express = require('express');
const atividadeController = require('../controllers/atividadeController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { atividadeValidator } = require('../validators/atividadeValidator');

const router = express.Router();

router.get('/evento/:eventoId', asyncHandler(atividadeController.findByEvento.bind(atividadeController)));
router.get('/:id', asyncHandler(atividadeController.findById.bind(atividadeController)));
router.post('/', authMiddleware, authorize('admin', 'organizador'), atividadeValidator, validateRequest, asyncHandler(atividadeController.create.bind(atividadeController)));
router.put('/:id', authMiddleware, authorize('admin', 'organizador'), atividadeValidator, validateRequest, asyncHandler(atividadeController.update.bind(atividadeController)));
router.delete('/:id', authMiddleware, authorize('admin', 'organizador'), asyncHandler(atividadeController.delete.bind(atividadeController)));

module.exports = router;
