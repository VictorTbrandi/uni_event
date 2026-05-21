const express = require('express');
const userController = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { createUserValidator, updateUserValidator } = require('../validators/userValidator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', authorize('admin'), asyncHandler(userController.findAll.bind(userController)));
router.get('/:id', authorize('admin', 'organizador', 'participante'), asyncHandler(userController.findById.bind(userController)));
router.post('/', authorize('admin'), createUserValidator, validateRequest, asyncHandler(userController.create.bind(userController)));
router.put('/:id', updateUserValidator, validateRequest, asyncHandler(userController.update.bind(userController)));
router.delete('/:id', authorize('admin'), asyncHandler(userController.delete.bind(userController)));

module.exports = router;
