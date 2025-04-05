const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const mealRoutes = require('./routes/meals');
const progressRoutes = require('./routes/progress');
const paymentRoutes = require('./routes/payments');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Explicitly check the loaded MongoDB URI
console.log('MongoDB URI from env:', process.env.MONGODB_URI ? 'Available' : 'Not available');

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required');
  process.exit(1);
}

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}

// Warn about missing Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('Warning: Razorpay credentials are missing. Payment functionality will be limited.');
}

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection with Atlas-specific options
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Use the new MongoDB URI provided by the user
    const mongoURI = 'mongodb+srv://roy123:Sanyamkimumy@cluster0.jorkd6p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Using MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      directConnection: false,
      retryWrites: true,
      w: 'majority',
      ssl: true
    };
    
    const conn = await mongoose.connect(mongoURI, mongoOptions);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error.message);
    console.error('Check your MongoDB credentials and network connection');
    
    // Proceed with server startup even if database connection fails
    console.warn('Starting server without database connection. Features requiring database will be limited.');
    return false;
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/payments', paymentRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    time: new Date().toISOString(),
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running', 
    time: new Date().toISOString(),
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.stack
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5007;
connectDB().then(connected => {
  if (connected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
    });
  } else {
    console.error('WARNING: Server started without database connection. Some features may not work.');
    app.listen(PORT, () => {
      console.log(`Server running WITHOUT DATABASE on port ${PORT}`);
    });
  }
}); 