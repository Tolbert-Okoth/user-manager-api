const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new user
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    const newUser = new User({ name, email });
    const savedUser = await newUser.save();
    res.status(201).json({
      message: 'User created successfully',
      user: savedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(500).json({
        message: 'Internal Server Error',
        error: `Duplicate email: ${req.body.email}`,
      });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Update user by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  if (!name && !email) {
    return res.status(400).json({ message: 'At least one field (name or email) is required to update' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { name, email }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

module.exports = router;
