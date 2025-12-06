const Issue = require("../models/Issue");
const { processIssueUpload, getIssueWithDuplicates } = require("../services/deduplicationService");
const { getAddressFromCoordinates } = require("../services/locationService");

/**
 * Create issue with deduplication
 */
exports.createIssue = async (req, res) => {
    try {
        let { description, citizenId, userType, latitude, longitude } = req.body;

        // Debug log to see what we're receiving
        console.log("🔍 Received data:", { description, latitude, longitude, citizenId, userType });

        if (!description) {
            return res.status(400).json({ message: "Description required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image required" });
        }

        // Parse latitude and longitude
        latitude = latitude ? parseFloat(latitude) : null;
        longitude = longitude ? parseFloat(longitude) : null;

        console.log("📍 Parsed coordinates:", { latitude, longitude });

        const imagePath = `uploads/${req.file.filename}`;

        // Get address if coordinates provided
        let address = null;
        if (latitude && longitude) {
            const locationData = await getAddressFromCoordinates(latitude, longitude);
            address = locationData.success ? locationData.formatted : null;
            console.log("🏘️ Address:", address);
        }

        // Process issue with deduplication
        const result = await processIssueUpload({
            description,
            citizenId: citizenId || "anonymous",
            userType: userType || "citizen",
            imagePath,
            latitude,
            longitude,
            address,
            category: req.body.category,
            severity: req.body.severity,
            location: req.body.location
        });

        console.log("✅ Result:", result);

        if (!result.success) {
            return res.status(500).json({ message: result.error });
        }

        res.json(result);
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getPendingIssues = async (req, res) => {
    try {
        // Get only main issues (not duplicates)
        const issues = await Issue.find({
            status: "In Progress",
            isDuplicate: false
        }).sort({ createdAt: -1 });

        // Enrich with reporter count
        const enrichedIssues = issues.map(issue => ({
            ...issue.toObject(),
            totalReporters: issue.reportCount + 1
        }));

        res.json(enrichedIssues);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get all issues for workers (main issues only)
 */
exports.getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ isDuplicate: false })
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get issue with duplicate information
 */
exports.getIssueDetails = async (req, res) => {
    try {
        const result = await getIssueWithDuplicates(req.params.id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        issue.workerImagePath = `uploads/${req.file.filename}`;
        issue.status = "Completed";
        issue.workerId = req.body.workerId || null;

        await issue.save();

        res.json({ message: "Issue updated", issue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.addFeedback = async (req, res) => {
    try {
        const { feedback } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        issue.feedback = feedback;
        issue.status = feedback === "done" ? "Verified" : "In Progress";

        await issue.save();
        res.json({ message: "Feedback submitted", issue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Reverse geocode coordinates to address
 * GET /api/reverse-geocode?latitude=LAT&longitude=LON
 */
exports.reverseGeocode = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and longitude required" });
        }

        const address = await getAddressFromCoordinates(parseFloat(latitude), parseFloat(longitude));
        res.json({ address });
    } catch (err) {
        console.error("Reverse geocode error:", err);
        res.status(500).json({ message: "Failed to get address", error: err.message });
    }
};
