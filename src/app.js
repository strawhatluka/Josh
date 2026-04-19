// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const helmet = require('helmet').default;
const path = require('path');
const memoriesRouter = require('./routes/memories');
const adminRouter = require('./routes/admin');
const galleryRouter = require('./routes/gallery');
const { SESSION_SECRET } = require('./config/admin');
const { pool } = require('./db');

function createApp() {
  const app = express();

  // Security headers with helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: [
            "'self'",
            'data:',
            'https://*.public.blob.vercel-storage.com',
            'https://*.vercel-storage.com'
          ],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for inline event handlers in admin panel
            'https://cdnjs.cloudflare.com' // Cropper.js CDN
          ],
          scriptSrcAttr: ["'unsafe-inline'"], // Required for onclick attributes
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Required for inline styles
            'https://cdnjs.cloudflare.com' // Cropper.js CSS
          ],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
      },
      crossOriginEmbedderPolicy: false, // Allow embedding resources from Vercel Blob
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: false
      }
    })
  );

  // CORS configuration - allow credentials for same-origin requests
  // In production with sameSite:'none', we must specify the exact origin
  app.use(
    cors({
      origin: process.env.NODE_ENV === 'production' ? 'https://josh.sunny-stack.com' : true,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));

  // Session middleware with PostgreSQL store for serverless persistence
  app.use(
    session({
      store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
      }),
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      },
      proxy: process.env.NODE_ENV === 'production' // Trust proxy in production
    })
  );

  // API Routes
  // IMPORTANT: Register /api/admin BEFORE /api/memories to avoid route conflicts
  // Without this order, /api/admin/memories would match /api/memories first
  app.use('/api/admin', adminRouter);
  app.use('/api/memories', memoriesRouter);
  app.use('/api/gallery', galleryRouter);

  // Serve HTML pages
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.get('/through-years', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/through-years.html'));
  });

  app.get('/memories', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/memories.html'));
  });

  app.get('/flowers', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/flowers.html'));
  });

  app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
  });

  // Error handling middleware
  app.use((err, req, res, _next) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  });

  return app;
}

module.exports = createApp;
module.exports.createApp = createApp;
