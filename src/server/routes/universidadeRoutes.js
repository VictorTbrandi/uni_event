const express = require('express');
const universidadeController = require('../controllers/universidadeController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { universidadeValidator } = require('../validators/universidadeValidator');

const router = express.Router();

router.get('/', asyncHandler(universidadeController.findAll.bind(universidadeController)));
router.get('/:id', asyncHandler(universidadeController.findById.bind(universidadeController)));
router.post('/', authMiddleware, authorize('admin'), universidadeValidator, validateRequest, asyncHandler(universidadeController.create.bind(universidadeController)));
router.put('/:id', authMiddleware, authorize('admin'), universidadeValidator, validateRequest, asyncHandler(universidadeController.update.bind(universidadeController)));
router.delete('/:id', authMiddleware, authorize('admin'), asyncHandler(universidadeController.delete.bind(universidadeController)));

module.exports = router;
