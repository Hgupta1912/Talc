const express = require('express');
const router = express.Router({ mergeParams: true });
const rateLimit = require('express-rate-limit');

const authenticate = require('../middleware/authenticate.js');

const {
  getOne,
  generate,
} = require('../controllers/critiqueSummaryController.js');

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// GET SAVED SUMMARY
router.get('/', authenticate, getOne);

// GENERATE OR REGENERATE SUMMARY
router.post('/', authenticate, generateLimiter, generate);

module.exports = router;
