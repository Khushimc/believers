const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    citizenId: String,
    userType: {
        type: String,
        default: "citizen"
    },
    imagePath: String,
    workerImagePath: String,
    category: String,
    severity: String,
    location: String,
    status: {
        type: String,
        default: "In Progress",
        enum: ["In Progress", "Completed", "Feedback Given"]
    },
    feedback: String,
    workerId: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Location data for deduplication
    latitude: Number,
    longitude: Number,
    address: String,
    
    // Duplicate tracking
    isDuplicate: {
        type: Boolean,
        default: false
    },
    duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
        default: null
    },
    reportCount: {
        type: Number,
        default: 1
    },
    reporters: [{
        citizenId: String,
        reportedAt: Date
    }]
});

module.exports = mongoose.model("Issue", IssueSchema);
