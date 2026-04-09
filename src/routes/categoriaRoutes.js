const express = require('express');
const categoriaController = require('../controllers/categoriaController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { categoriaValidator } = require('../validators/categoriaValidator');

const router = express.Router();

router.get('/', asyncHandler(categoriaController.findAll.bind(categoriaController)));
router.get('/:id', asyncHandler(categoriaController.findById.bind(categoriaController)));
router.post('/', authMiddleware, authorize('admin', 'organizador'), categoriaValidator, validateRequest, asyncHandler(categoriaController.create.bind(categoriaController)));
router.put('/:id', authMiddleware, authorize('admin', 'organizador'), categoriaValidator, validateRequest, asyncHandler(categoriaController.update.bind(categoriaController)));
router.delete('/:id', authMiddleware, authorize('admin'), asyncHandler(categoriaController.delete.bind(categoriaController)));

module.exports = router;
