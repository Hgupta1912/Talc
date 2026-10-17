const {
  findAllArtworks,
  findArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} = require('../db/queries.js');

const {
  cloudinary,
  uploadImageBuffer,
} = require('../config/cloudinary.js');

const requiredFields = [
  'title',
  'medium',
  'genre',
  'focus',
];

const validString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

// GET ALL ARTWORKS
const getAll = async (req, res, next) => {
  try {
    const artworks = await findAllArtworks();
    res.status(200).json(artworks);
  } catch (err) {
    next(err);
  }
};

// GET ONE ARTWORK
const getOne = async (req, res, next) => {
  try {
    const artwork = await findArtworkById(req.params.id);

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      });
    }

    res.status(200).json(artwork);
  } catch (err) {
    next(err);
  }
};

// CREATE ARTWORK
const create = async (req, res, next) => {
  let publicId;

  try {
    const body = req.body || {};
    const { title, description, medium, genre, focus } = body;

    if (
      !req.file ||
      requiredFields.some(field => !validString(body[field]))
    ) {
      return res.status(400).json({
        error: 'Image, title, medium, genre, and focus are required',
      });
    }

    if (
      description != null &&
      typeof description !== 'string'
    ) {
      return res.status(400).json({
        error: 'Invalid description',
      });
    }

    const uploadResult = await uploadImageBuffer(req.file.buffer);
    publicId = uploadResult.public_id;

    const artwork = await createArtwork(req.user.userId, {
      title: title.trim(),
      description: description?.trim() || null,
      medium: medium.trim(),
      genre: genre.trim(),
      focus: focus.trim(),
      imageUrl: uploadResult.secure_url,
    });

    res.status(201).json(artwork);
  } catch (err) {
    // Remove the uploaded image if the database operation fails.
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cleanupErr) {
        console.error('Cloudinary cleanup failed:', cleanupErr);
      }
    }

    next(err);
  }
};

// UPDATE ARTWORK METADATA
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const artwork = await findArtworkById(id);

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      });
    }

    if (artwork.artistId !== req.user.userId) {
      return res.status(403).json({
        error: 'You can only edit your own artwork',
      });
    }

    const data = {};

    for (const field of requiredFields) {
      if (body[field] !== undefined) {
        if (!validString(body[field])) {
          return res.status(400).json({
            error: `Invalid ${field}`,
          });
        }

        data[field] = body[field].trim();
      }
    }

    if (body.description !== undefined) {
      if (
        body.description !== null &&
        typeof body.description !== 'string'
      ) {
        return res.status(400).json({
          error: 'Invalid description',
        });
      }

      data.description = body.description?.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: 'No valid fields provided',
      });
    }

    const updated = await updateArtwork(
      id,
      req.user.userId,
      data
    );

    if (!updated) {
      return res.status(404).json({
        error: 'Artwork not found',
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE ARTWORK
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const artwork = await findArtworkById(id);

    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
      });
    }

    if (artwork.artistId !== req.user.userId) {
      return res.status(403).json({
        error: 'You can only delete your own artwork',
      });
    }

    const count = await deleteArtwork(id, req.user.userId);

    if (count === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
      });
    }

    // Cloudinary cleanup requires saving imagePublicId.
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
};
