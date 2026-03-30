import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

export const signup = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, role: role === 'admin' ? 'admin' : 'user' });
    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Failed to create user' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({ token, user: { id: user._id, username: user.username, role: user.role, createdAt: user.createdAt } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Failed to login' });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load user' });
  }
};
