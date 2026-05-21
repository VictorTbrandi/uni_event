const express = require('express');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, asyncHandler(authController.register.bind(authController)));
router.post('/login', loginValidator, validateRequest, asyncHandler(authController.login.bind(authController)));
router.post('/forgot-password', forgotPasswordValidator, validateRequest, asyncHandler(authController.forgotPassword.bind(authController)));
router.post('/reset-password', resetPasswordValidator, validateRequest, asyncHandler(authController.resetPassword.bind(authController)));
router.get('/me', authMiddleware, asyncHandler(authController.me.bind(authController)));

module.exports = router;
