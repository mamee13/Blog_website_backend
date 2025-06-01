const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/authRoutes');
const postRoutes = require('./Routes/postRoutes');
const contactRoutes = require('./Routes/contactRoutes');
const errorController = require('./Controllers/errorController');
const helmet = require('helmet');

// Load environment variables
dotenv.config({ path: './Config.env' });

// Initialize Express app
const app = express();

// Middleware
// IMPORTANT: Body parsers first, then static files, then security, then CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static('public/images'));

// Helmet for security headers
// Make sure your current backend and frontend URLs are correctly listed here
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'", // Allows connections to the same origin (your backend)
        "https://blog-website-g0gw.onrender.com",   // Your CURRENT backend URL
        "https://blog-website-l3ib.vercel.app",   // Your CURRENT frontend URL
        "http://localhost:3000"                   // Local frontend development
        // Add any other domains your frontend/backend needs to connect to
      ],
      imgSrc: ["'self'", "data:", "blob:", "https://blog-website-g0gw.onrender.com"], // Allow images from self, data URLs, blob URLs, and your backend if serving images directly via API routes. Note: /images is already served by express.static
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Review if 'unsafe-inline' and 'unsafe-eval' are truly necessary long-term
      styleSrc: ["'self'", "'unsafe-inline'"], // Review if 'unsafe-inline' is truly necessary long-term
    }
  }
}));

// CORS Configuration
// THIS IS THE CRITICAL PART FOR THE CORS ERROR
const allowedOrigins = [
  'http://localhost:3000',                // Local frontend development
  'https://blog-website-l3ib.vercel.app', // Your CURRENT Vercel frontend
  // 'https://blog-website-g0gw.onrender.com' // Your backend (usually not needed unless your backend makes requests to itself via its public URL in a way that triggers CORS, or if frontend/backend share a domain and this helps)
];

// For production, you might want to read this from an environment variable
// const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Blog API is running!');
});

// Error handling middleware - should be last
app.use(errorController);

module.exports = app;
