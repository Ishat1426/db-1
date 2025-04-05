const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Check if Razorpay credentials are set
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.error('Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
}

// Initialize Razorpay with test keys if real ones are not available
const razorpay = new Razorpay({
  key_id: keyId || 'rzp_test_dummy_id',
  key_secret: keySecret || 'dummy_secret'
});

// Add dummy payment credentials to response
router.get('/get-key', authMiddleware, (req, res) => {
  res.json({
    keyId: keyId || 'rzp_test_dummy_id',
    message: 'Using test credentials for development'
  });
});

// Create order for membership payment
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const options = {
      amount: 99900, // amount in smallest currency unit (99900 paise = ₹999)
      currency: 'INR',
      receipt: `order_${user._id}_${Date.now()}`,
      payment_capture: 1
    };

    try {
      const order = await razorpay.orders.create(options);
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId || 'rzp_test_dummy_id'
      });
    } catch (razorpayError) {
      console.log('Razorpay API error:', razorpayError.message);
      // If Razorpay API fails, provide a dummy order ID for development
      res.json({
        orderId: `dummy_order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        keyId: keyId || 'rzp_test_dummy_id',
        isDummyOrder: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify payment signature
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    // Find user by userId from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isDummyOrder
    } = req.body;

    // For dummy orders in development, skip verification
    if (isDummyOrder) {
      console.log('Processing dummy payment verification');
      // Update user membership status
      user.isMember = true;
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      user.membershipExpiry = expiryDate;
      await user.save();
      
      return res.json({
        message: 'Development payment processed successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isMember: user.isMember,
          membershipExpiry: user.membershipExpiry
        }
      });
    }

    // Normal verification process
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', keySecret || 'dummy_secret')
      .update(sign)
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Update user membership status
      user.isMember = true;
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      user.membershipExpiry = expiryDate;
      await user.save();
      
      res.json({
        message: 'Payment verified successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isMember: user.isMember,
          membershipExpiry: user.membershipExpiry
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Demo route for test upgrade
router.post('/test-upgrade', authMiddleware, async (req, res) => {
  try {
    // Update user to premium status
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set membership to true
    user.isMember = true;
    
    // Set expiry date one year from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    user.membershipExpiry = expiryDate;
    
    await user.save();
    
    console.log(`User ${user.email} upgraded to premium membership successfully`);
    
    res.json({
      success: true,
      message: 'Membership upgraded to premium',
      expiryDate: user.membershipExpiry
    });
  } catch (error) {
    console.error('Error upgrading membership:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 