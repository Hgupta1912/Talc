const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate.js');
const upload = require('../middleware/upload.js');
const commentRouter = require('./commentRouter.js');
const critiqueSummaryRouter = require('./critiqueSummaryRouter.js');

const {
  getAll,
  getOne,
  create,
  update,
  remove,
} = require('../controllers/artworkController.js');

// ARTWORK ROUTES
router.get('/', getAll);
router.post('/', authenticate, upload.single('image'), create);

// NESTED COMMENT ROUTES
router.use('/:artworkId/comments', commentRouter);
router.use('/:artworkId/summary', critiqueSummaryRouter);


// INDIVIDUAL ARTWORK ROUTES
router.get('/:id', getOne);
router.patch('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

module.exports = router;
