// server.js
const express = require('express');
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer storage: timestamped filename to avoid collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// serve frontend static files placed in backend/public
app.use(express.static(path.join(__dirname, 'public')));

// serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));

/**
 * POST /upload
 * Expects a form field named "image" (enctype="multipart/form-data")
 */
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('<h3>No file uploaded</h3><a href="/">Go back</a>');
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  // Send a simple HTML success page (no JSON)
  res.send(`
    <h3>Upload successful</h3>
    <p>Filename: ${req.file.filename}</p>
    <p>View image: <a href="${fileUrl}" target="_blank">${fileUrl}</a></p>
    <img src="${fileUrl}" style="max-width:400px; display:block; margin-top:10px;" />
    <p><a href="/">Upload another</a></p>
  `);
});

// optional: root route serves public/upload.html automatically because of express.static
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
