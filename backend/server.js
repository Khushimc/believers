const express = require('express');
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + "-" + safeName);
  }
});

const upload = multer({ storage });

// Serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));


// ==========================================
// ROUTE: Show upload form
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <h2>Upload Image</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required />
      <button type="submit">Upload</button>
    </form>
  `);
});


// ==========================================
// ROUTE: Handle file upload
// ==========================================
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.send("<h3>No file uploaded!</h3>");
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.send(`
    <h2>Upload Successful</h2>
    <p>Saved as: ${req.file.filename}</p>
    <img src="${fileUrl}" style="width:300px; margin-top:10px;" />
    <p><a href="/">Upload another</a></p>
  `);
});


// ==========================================
// START SERVER
// ==========================================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
