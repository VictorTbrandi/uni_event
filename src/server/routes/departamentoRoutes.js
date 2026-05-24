const express = require('express');
const departamentoController = require('../controllers/departamentoController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { departamentoValidator } = require('../validators/departamentoValidator');

const router = express.Router();

router.get('/', asyncHandler(departamentoController.findAll.bind(departamentoController)));
router.get('/:id', asyncHandler(departamentoController.findById.bind(departamentoController)));
router.post('/', authMiddleware, authorize('admin'), departamentoValidator, validateRequest, asyncHandler(departamentoController.create.bind(departamentoController)));
router.put('/:id', authMiddleware, authorize('admin'), departamentoValidator, validateRequest, asyncHandler(departamentoController.update.bind(departamentoController)));
router.delete('/:id', authMiddleware, authorize('admin'), asyncHandler(departamentoController.delete.bind(departamentoController)));

module.exports = router;
