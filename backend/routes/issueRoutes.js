const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const issueController = require("../controllers/issueController");

const router = express.Router();

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});
const upload = multer({ storage });

// =====================================
// Citizen uploads new issue WITH DEDUPLICATION
// POST /api/upload
// Body: { description, citizenId, userType, latitude, longitude }
// =====================================
router.post("/upload", upload.single("image"), issueController.createIssue);

// =====================================
// Get pending issues (main issues only - no duplicates)
// GET /api/issues
// =====================================
router.get("/issues", issueController.getPendingIssues);

// =====================================
// Get all issues
// GET /api/all-issues
// =====================================
router.get("/all-issues", issueController.getAllIssues);

// =====================================
// Get issue details with duplicate information
// GET /api/issue/:id
// =====================================
router.get("/issue/:id", issueController.getIssueDetails);

// =====================================
// Reverse geocode coordinates to address
// GET /api/reverse-geocode?latitude=LAT&longitude=LON
// =====================================
router.get("/reverse-geocode", issueController.reverseGeocode);

// =====================================
// Worker marks issue as completed
// POST /api/update/:id
// =====================================
router.post("/update/:id", upload.single("workerImage"), issueController.updateIssue);

// =====================================
// Citizen submits feedback
// POST /api/feedback/:id
// =====================================
router.post("/feedback/:id", issueController.addFeedback);

// =====================================
// Admin assigns issue to worker
// POST /api/assign/:id
// Body: { workerId }
// =====================================
router.post("/assign/:id", async (req, res) => {
  try {
    const { workerId } = req.body;
    const Issue = require("../models/Issue");
    
    if (!workerId) {
      return res.status(400).json({ message: "Worker ID is required" });
    }
    
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { workerId: workerId },
      { new: true }
    );
    
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    
    res.json({ message: "Issue assigned successfully", issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
