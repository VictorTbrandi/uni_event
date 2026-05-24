const express = require('express');
const salaController = require('../controllers/salaController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { salaValidator } = require('../validators/salaValidator');

const router = express.Router();

router.get('/', asyncHandler(salaController.findAll.bind(salaController)));
router.get('/:id', asyncHandler(salaController.findById.bind(salaController)));
router.post('/', authMiddleware, authorize('admin'), salaValidator, validateRequest, asyncHandler(salaController.create.bind(salaController)));
router.put('/:id', authMiddleware, authorize('admin'), salaValidator, validateRequest, asyncHandler(salaController.update.bind(salaController)));
router.delete('/:id', authMiddleware, authorize('admin'), asyncHandler(salaController.delete.bind(salaController)));

module.exports = router;
