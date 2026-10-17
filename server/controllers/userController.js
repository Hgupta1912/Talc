const {
  findUserById,
  findUserByUsername,
  findUserProfileByUsername,
  updateUser,
  findUserPasswordById,
  updateUserPassword,
} = require('../db/queries.js');

const bcrypt = require('bcryptjs');


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


const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const userId = req.user.userId;

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      return res.status(400).json({
        error: 'Current password and new password are required',
      });
    }

    if (
      newPassword.length < 6 ||
      Buffer.byteLength(newPassword, 'utf8') > 72
    ) {
      return res.status(400).json({
        error: 'New password must be at least 3 characters and at most 72 bytes',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: 'New password must be different',
      });
    }

    const user = await findUserPasswordById(userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(400).json({
        error: 'Current password is incorrect',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    const result = await updateUserPassword(
      userId,
      user.password,
      newHash
    );

    if (result.count === 0) {
      return res.status(409).json({
        error: 'Password was changed concurrently. Please try again.',
      });
    }

    return res.status(200).json({
      message: 'Password updated successfully',
    });

  } catch (err) {
    next(err);
  }
};


module.exports = { getMe, updateMe, getUserProfile, changePassword };