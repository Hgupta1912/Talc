const {
  findUserById,
  findUserByUsername,
  findPublicUserByUsername,
  findPublicUsers,
  updateUser,
} = require('../db/queries.js');

const getMe = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { username } = req.body;
    const data = {};

    if (username !== undefined) {
      const existing = await findUserByUsername(username);
      if (existing && existing.id !== req.user.userId) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      data.username = username;
    }

    const updated = await updateUser(req.user.userId, data);
    res.status(200).json({
      id: updated.id,
      email: updated.email,
      username: updated.username,
    });
  } catch (err) {
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await findUserProfileByUsername(username);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};


module.exports = { getMe, updateMe, getUserProfile };