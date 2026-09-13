const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { authenticateAdmin } = require('../middleware/auth');

// Configure Cloudinary dynamically if credentials exist
function configureCloudinary() {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    return true;
  }
  return false;
}

// Memory storage for serverless compatibility (Vercel, AWS Lambda, Docker)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, JPEG, PNG, WEBP) are supported!'));
  }
});

// Helper: Stream buffer to Cloudinary
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'nagadatta_agencies',
        format: 'webp',
        quality: 'auto',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/upload - Admin image upload
router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const hasCloudinary = configureCloudinary();

    if (hasCloudinary) {
      try {
        const cloudResult = await uploadToCloudinary(req.file.buffer);
        return res.json({
          success: true,
          message: 'Image uploaded to Cloudinary successfully.',
          imageUrl: cloudResult.secure_url,
          publicId: cloudResult.public_id
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
        return res.status(500).json({
          success: false,
          message: 'Cloudinary upload failed: ' + (cloudErr.message || 'Error processing image')
        });
      }
    }

    // Fallback for local development when Cloudinary credentials are not set
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) {}
    }

    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname) || '.webp'}`;
    const filePath = path.join(uploadDir, filename);

    try {
      fs.writeFileSync(filePath, req.file.buffer);
      const host = req.get('host');
      const protocol = req.protocol;
      const imageUrl = `${protocol}://${host}/uploads/${filename}`;

      return res.json({
        success: true,
        message: 'Image uploaded locally.',
        imageUrl,
        publicId: ''
      });
    } catch (writeErr) {
      // In read-only serverless environment without Cloudinary, return Data URL
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      return res.json({
        success: true,
        message: 'Image uploaded as Data URL.',
        imageUrl: dataUrl,
        publicId: ''
      });
    }
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to process image upload.' });
  }
});

// DELETE /api/upload - Remove Cloudinary asset
router.delete('/', authenticateAdmin, async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'publicId is required.' });
    }

    const hasCloudinary = configureCloudinary();
    if (hasCloudinary) {
      await cloudinary.uploader.destroy(publicId);
      return res.json({ success: true, message: 'Image deleted from Cloudinary.' });
    }

    res.json({ success: true, message: 'Image reference removed.' });
  } catch (err) {
    console.error('Cloudinary destroy error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete Cloudinary asset.' });
  }
});

module.exports = router;
