const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.js');
const {
  getMe,
  updateMe,
  getUserProfile,
} = require('../controllers/userController.js');

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);

router.get('/:username', getUserProfile);

module.exports = router;
