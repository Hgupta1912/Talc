const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const authenticate = require('../middleware/authenticate.js');

const {
  getMe,
  updateMe,
  getUserProfile,
  changePassword,
} = require('../controllers/userController.js');

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// CURRENT USER
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);

// CHANGE PASSWORD
router.patch(
  '/me/password',
  authenticate,
  passwordLimiter,
  changePassword
);

// PUBLIC PROFILE
router.get('/:username', getUserProfile);

module.exports = router;
