
const {
  findArtworkForComments,
  findCommentsByArtwork,
  findCommentForPermissions,
  createComment,
  updateComment,
  deleteComment,
} = require('../db/queries.js');

const validContent = (content) =>
  typeof content === 'string' &&
  content.trim().length > 0 &&
  content.trim().length <= 2000;

// GET ALL COMMENTS FOR AN ARTWORK
const getAll = async (req, res, next) => {
  try {
    const { artworkId } = req.params;

    const artwork = await findArtworkForComments(artworkId);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    const comments = await findCommentsByArtwork(artworkId);
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};

// CREATE COMMENT
const create = async (req, res, next) => {
  try {
    const { artworkId } = req.params;
    const { content } = req.body;

    if (!validContent(content)) {
      return res.status(400).json({ error: 'Invalid comment content' });
    }

    const artwork = await findArtworkForComments(artworkId);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    const comment = await createComment(
      artworkId,
      req.user.userId,
      content.trim()
    );

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// UPDATE COMMENT
const update = async (req, res, next) => {
  try {
    const { artworkId, commentId } = req.params;
    const { content } = req.body;

    if (!validContent(content)) {
      return res.status(400).json({ error: 'Invalid comment content' });
    }

    const existing = await findCommentForPermissions(
      artworkId,
      commentId
    );

    if (!existing) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existing.authorId !== req.user.userId) {
      return res.status(403).json({
        error: 'You can only edit your own comments'
      });
    }

    const comment = await updateComment(
      artworkId,
      commentId,
      req.user.userId,
      content.trim()
    );

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(200).json(comment);
  } catch (err) {
    next(err);
  }
};

// DELETE COMMENT
const remove = async (req, res, next) => {
  try {
    const { artworkId, commentId } = req.params;
    const userId = req.user.userId;

    const existing = await findCommentForPermissions(
      artworkId,
      commentId
    );

    if (!existing) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isCommenter = existing.authorId === userId;
    const isArtist = existing.artwork.artistId === userId;

    if (!isCommenter && !isArtist) {
      return res.status(403).json({
        error: 'Not authorized to delete this comment'
      });
    }

    const count = await deleteComment(
      artworkId,
      commentId,
      userId
    );

    if (count === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
};
