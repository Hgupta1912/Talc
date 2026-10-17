const {
  findArtworkForSummary,
  findCritiqueSummary,
  upsertCritiqueSummary,
} = require('../db/queries.js');

const {
  generateCritiqueSummary,
} = require('../config/gemini.js');

// GET EXISTING SUMMARY
const getOne = async (req, res, next) => {
  try {
    const { artworkId } = req.params;

    const artwork = await findArtworkForSummary(artworkId);

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      });
    }

    if (artwork.artistId !== req.user.userId) {
      return res.status(403).json({
        error: 'Only the artist can view this summary',
      });
    }

    const summary = await findCritiqueSummary(artworkId);

    if (!summary) {
      return res.status(404).json({
        error: 'No critique summary generated yet',
      });
    }

    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};

// GENERATE OR REGENERATE SUMMARY
const generate = async (req, res, next) => {
  try {
    const { artworkId } = req.params;

    const artwork = await findArtworkForSummary(artworkId);

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      });
    }

    if (artwork.artistId !== req.user.userId) {
      return res.status(403).json({
        error: 'Only the artist can generate summaries',
      });
    }

    if (artwork.comments.length === 0) {
      return res.status(400).json({
        error: 'No comments to summarize',
      });
    }

    const generated = await generateCritiqueSummary(artwork);

    const summary = await upsertCritiqueSummary(
      artworkId,
      generated,
      artwork.comments.length
    );

    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOne,
  generate,
};
