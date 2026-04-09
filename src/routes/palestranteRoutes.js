const express = require('express');
const palestranteController = require('../controllers/palestranteController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { palestranteValidator } = require('../validators/palestranteValidator');

const router = express.Router();

router.get('/', asyncHandler(palestranteController.findAll.bind(palestranteController)));
router.get('/:id', asyncHandler(palestranteController.findById.bind(palestranteController)));
router.post('/', authMiddleware, authorize('admin', 'organizador'), palestranteValidator, validateRequest, asyncHandler(palestranteController.create.bind(palestranteController)));
router.put('/:id', authMiddleware, authorize('admin', 'organizador'), palestranteValidator, validateRequest, asyncHandler(palestranteController.update.bind(palestranteController)));
router.delete('/:id', authMiddleware, authorize('admin'), asyncHandler(palestranteController.delete.bind(palestranteController)));

module.exports = router;
