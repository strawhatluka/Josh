const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH } = require('../config/admin');
const { requireAuth } = require('../middleware/auth');
const {
  readGallery,
  addPhoto,
  updatePhoto,
  deletePhoto,
  updatePhotoOrder
} = require('../utils/gallery');
const { readMemories, updateMemory, deleteMemory } = require('../utils/storage');
const { uploadFile, deleteFile } = require('../utils/blob');
const { adminLoginLimiter } = require('../config/rateLimits');

const router = express.Router();

// Configure multer for file uploads (memory storage for Vercel Blob)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Login endpoint - rate limited to prevent brute force attacks
router.post('/login', adminLoginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    req.session.isAdmin = true;
    req.session.username = username;

    // Explicitly save session before responding
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to save session'
        });
      }

      res.json({
        success: true,
        message: 'Login successful'
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out' });
  });
});

// Check auth status
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: !!(req.session && req.session.isAdmin)
  });
});

// Gallery endpoints
router.get('/gallery', requireAuth, async (req, res) => {
  try {
    const photos = await readGallery();
    res.json({ success: true, photos });
  } catch (error) {
    console.error('Error loading gallery:', error);
    res.status(500).json({ success: false, message: 'Failed to load gallery' });
  }
});

router.post('/gallery', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded'
      });
    }

    const { caption } = req.body;

    // Upload to Vercel Blob
    const { url } = await uploadFile(req.file.buffer, req.file.originalname, 'gallery');

    // Save to database
    const photo = await addPhoto({
      filename: req.file.originalname,
      photoUrl: url,
      caption: caption || ''
    });

    res.json({
      success: true,
      message: 'Photo added successfully',
      photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo'
    });
  }
});

router.put('/gallery/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const photo = await updatePhoto(id, { caption });

    res.json({
      success: true,
      message: 'Photo updated successfully',
      photo
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update photo'
    });
  }
});

router.delete('/gallery/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from database (returns photo data including URL)
    const photo = await deletePhoto(parseInt(id));

    // Delete from Vercel Blob
    if (photo && photo.photo_url) {
      await deleteFile(photo.photo_url);
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete photo'
    });
  }
});

router.patch('/gallery/reorder', requireAuth, async (req, res) => {
  try {
    const { photoOrders } = req.body;

    if (!Array.isArray(photoOrders)) {
      return res.status(400).json({
        success: false,
        message: 'photoOrders must be an array'
      });
    }

    await updatePhotoOrder(photoOrders);

    res.json({
      success: true,
      message: 'Photo order updated successfully'
    });
  } catch (error) {
    console.error('Error reordering photos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reorder photos'
    });
  }
});

// Memories management endpoints
router.get('/memories', requireAuth, async (req, res) => {
  try {
    const memories = await readMemories();
    res.json({ success: true, memories });
  } catch (error) {
    console.error('Error loading memories:', error);
    res.status(500).json({ success: false, message: 'Failed to load memories' });
  }
});

router.put('/memories/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { from, message } = req.body;

    const memory = await updateMemory(parseInt(id), { from, message });

    res.json({
      success: true,
      message: 'Memory updated successfully',
      memory
    });
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update memory'
    });
  }
});

router.delete('/memories/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from database (returns memory data including photo URL)
    const memory = await deleteMemory(parseInt(id));

    // Delete photo from Vercel Blob if exists
    if (memory && memory.photo) {
      await deleteFile(memory.photo);
    }

    res.json({
      success: true,
      message: 'Memory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete memory'
    });
  }
});

// Note: Memory photo editing routes removed - visitors crop photos when submitting

module.exports = router;
