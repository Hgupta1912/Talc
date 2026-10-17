const prisma = require('./prisma.js');

// AUTH QUERIES

const findUserByEmail = async (email) =>
  prisma.user.findUnique({ where: { email } });

const findUserByUsername = async (username) =>
  prisma.user.findUnique({ where: { username } });

const createUser = async (data) =>
  prisma.user.create({ data });


const findUserPasswordById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      password: true,
    },
  });

const updateUserPassword = (id, oldHash, newHash) =>
  prisma.user.updateMany({
    where: {
      id,
      password: oldHash,
    },
    data: {
      password: newHash,
    },
  });


// USER QUERIES

const findUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      artworks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

const findUserProfileByUsername = (username) =>
  prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      createdAt: true,
      artworks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

const updateUser = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
    },
  });

// COMMENT QUERIES

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  authorId: true,
  artworkId: true,
  author: {
    select: {
      id: true,
      username: true,
    },
  },
};

const findArtworkForComments = (artworkId) =>
  prisma.artwork.findUnique({
    where: { id: artworkId },
    select: { id: true },
  });

const findCommentsByArtwork = (artworkId) =>
  prisma.comment.findMany({
    where: { artworkId },
    orderBy: { createdAt: 'asc' },
    select: commentSelect,
  });

const findCommentForPermissions = (artworkId, commentId) =>
  prisma.comment.findFirst({
    where: {
      id: commentId,
      artworkId,
    },
    select: {
      authorId: true,
      artwork: {
        select: { artistId: true },
      },
    },
  });


const createComment = (artworkId, authorId, content) =>
  prisma.comment.create({
    data: {
      artworkId,
      authorId,
      content,
    },
    select: commentSelect,
  });

const updateComment = async (artworkId, commentId, authorId, content) => {
  const result = await prisma.comment.updateMany({
    where: {
      id: commentId,
      artworkId,
      authorId,
    },
    data: { content },
  });

  if (result.count === 0) return null;

  return prisma.comment.findUnique({
    where: { id: commentId },
    select: commentSelect,
  });
};

const deleteComment = async (artworkId, commentId, userId) => {
  const result = await prisma.comment.deleteMany({
    where: {
      id: commentId,
      artworkId,
      OR: [
        { authorId: userId },
        { artwork: { is: { artistId: userId } } },
      ],
    },
  });

  return result.count;
};

// ARTWORK QUERIES

const artworkSelect = {
  id: true,
  title: true,
  description: true,
  medium: true,
  genre: true,
  focus: true,
  imageUrl: true,
  artistId: true,
  createdAt: true,
  artist: {
    select: {
      id: true,
      username: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
};

// GET ALL ARTWORKS; this is the current recomender algorithm... the latest 30 artworks, ordered by creation date. This is a placeholder for a more sophisticated RL algorithm in the future.
const findAllArtworks = () =>
  prisma.artwork.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: artworkSelect,
  });

// GET ONE ARTWORK
const findArtworkById = (id) =>
  prisma.artwork.findUnique({
    where: { id },
    select: artworkSelect,
  });

// CREATE ARTWORK
const createArtwork = (artistId, data) =>
  prisma.artwork.create({
    data: {
      ...data,
      artistId,
    },
    select: artworkSelect,
  });

// UPDATE ARTWORK
const updateArtwork = async (id, artistId, data) => {
  const result = await prisma.artwork.updateMany({
    where: {
      id,
      artistId,
    },
    data,
  });

  if (result.count === 0) return null;

  return findArtworkById(id);
};

// DELETE ARTWORK
const deleteArtwork = async (id, artistId) => {
  const result = await prisma.artwork.deleteMany({
    where: {
      id,
      artistId,
    },
  });

  return result.count;
};

// CRITIQUE SUMMARY QUERIES


// GET ARTWORK AND COMMENTS FOR AI ANALYSIS
const findArtworkForSummary = (artworkId) =>
  prisma.artwork.findUnique({
    where: { id: artworkId },
    select: {
      id: true,
      title: true,
      description: true,
      medium: true,
      genre: true,
      focus: true,
      artistId: true,
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          content: true,
        },
      },
    },
  });

// GET SAVED SUMMARY
const findCritiqueSummary = (artworkId) =>
  prisma.critiqueSummary.findUnique({
    where: { artworkId },
  });

// CREATE OR REPLACE SUMMARY
const upsertCritiqueSummary = (artworkId, summary, commentCount) =>
  prisma.critiqueSummary.upsert({
    where: { artworkId },
    create: {
      artworkId,
      ...summary,
      commentCount,
    },
    update: {
      ...summary,
      commentCount,
      generatedAt: new Date(),
    },
  });


module.exports = {
  findUserByEmail,
  findUserByUsername,
  createUser,
  findUserPasswordById,
  updateUserPassword,
  findUserById,
  findUserProfileByUsername,
  updateUser,
  findArtworkForComments,
  findCommentsByArtwork,
  findCommentForPermissions,
  createComment,
  updateComment,
  deleteComment,
  findAllArtworks,
  findArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  findArtworkForSummary,
  findCritiqueSummary,
  upsertCritiqueSummary,
};
