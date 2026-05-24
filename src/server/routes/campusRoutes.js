const express = require('express');
const campusController = require('../controllers/campusController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { campusValidator } = require('../validators/campusValidator');

const router = express.Router();

router.get('/', asyncHandler(campusController.findAll.bind(campusController)));
router.get('/:id', asyncHandler(campusController.findById.bind(campusController)));
router.post('/', authMiddleware, authorize('admin'), campusValidator, validateRequest, asyncHandler(campusController.create.bind(campusController)));
router.put('/:id', authMiddleware, authorize('admin'), campusValidator, validateRequest, asyncHandler(campusController.update.bind(campusController)));
router.delete('/:id', authMiddleware, authorize('admin'), asyncHandler(campusController.delete.bind(campusController)));

module.exports = router;
