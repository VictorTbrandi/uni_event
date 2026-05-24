const express = require('express');
const cursoController = require('../controllers/cursoController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { cursoValidator } = require('../validators/cursoValidator');

const router = express.Router();

router.get('/', asyncHandler(cursoController.findAll.bind(cursoController)));
router.get('/:id', asyncHandler(cursoController.findById.bind(cursoController)));
router.post('/', authMiddleware, authorize('admin'), cursoValidator, validateRequest, asyncHandler(cursoController.create.bind(cursoController)));
router.put('/:id', authMiddleware, authorize('admin'), cursoValidator, validateRequest, asyncHandler(cursoController.update.bind(cursoController)));
router.delete('/:id', authMiddleware, authorize('admin'), asyncHandler(cursoController.delete.bind(cursoController)));

module.exports = router;
