const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { feedbackValidator } = require('../validators/feedbackValidator');

const router = express.Router();

router.post('/', authMiddleware, authorize('participante', 'admin'), feedbackValidator, validateRequest, asyncHandler(feedbackController.create.bind(feedbackController)));
router.get('/eventos/:id', authMiddleware, authorize('admin', 'organizador'), asyncHandler(feedbackController.getByEvent.bind(feedbackController)));

module.exports = router;
