const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'eduquery_super_secret_jwt_key_2026_change_in_production';

const generateToken = (id, role, email, name) => {
  return jwt.sign({ id, role, email, name }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Pure AuthService functions
 */
const registerUser = async ({ name, email, password, role = 'student' }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password with bcrypt (cost 12 as per spec requirements)
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: ['admin', 'super_admin', 'dept_admin'].includes(role) ? role : 'student',
    lastLogin: new Date(),
  });

  const token = generateToken(user._id, user.role, user.email, user.name);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
    },
    token,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role, user.email, user.name);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
    },
    token,
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastLogin: user.lastLogin,
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  generateToken,
};
