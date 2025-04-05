const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to check if database is connected
const isDatabaseConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Register a new user
exports.register = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user without any prefilled data
    user = new User({
      name,
      email,
      password
    });

    // Save user to database
    await user.save();
    console.log('User registered successfully:', { id: user.id, email: user.email });

    // Generate JWT token
    const payload = {
      userId: user.id,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dietbuddy_jwt_secret_key_2024',
      { expiresIn: '7d' }
    );

    // Send response - exclude password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User logged in successfully:', { id: user.id, email: user.email });

    // Generate JWT token
    const payload = {
      userId: user.id,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dietbuddy_jwt_secret_key_2024',
      { expiresIn: '7d' }
    );

    // Send response - exclude password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      measurements: user.measurements,
      fitnessGoal: user.fitnessGoal
    };

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }

    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('favouriteWorkouts')
      .populate('favouriteMeals');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
    }
    
    const { name, email, measurements, fitnessGoal, password } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (measurements) updateFields.measurements = measurements;
    if (fitnessGoal) updateFields.fitnessGoal = fitnessGoal;

    // If password is being updated, hash it
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 