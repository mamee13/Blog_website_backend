const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/authRoutes');
const postRoutes = require('./Routes/postRoutes');
const errorController = require('./Controllers/errorcontroller');

// Load environment variables
dotenv.config({ path: './Config.env' });

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use('/images', express.static('public/images'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', authRoutes);
app.use('/api/posts', postRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Blog API is running!');
});

// Add this after all your routes
app.use(errorController);

module.exports = app; // Export the app for use in server.js