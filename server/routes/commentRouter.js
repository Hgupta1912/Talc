const express = require('express');
const router = express.Router({ mergeParams: true });

const authenticate = require('../middleware/authenticate.js');

const {
  getAll,
  create,
  update,
  remove,
} = require('../controllers/commentController.js');

router.get('/', getAll);
router.post('/', authenticate, create);
router.patch('/:commentId', authenticate, update);
router.delete('/:commentId', authenticate, remove);

module.exports = router;
