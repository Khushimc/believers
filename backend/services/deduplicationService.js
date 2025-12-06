const Issue = require("../models/Issue");

const LOCATION_RADIUS_METERS = 50; // Within 50 meters = same location
const DESCRIPTION_SIMILARITY_THRESHOLD = 0.6; // 60% text similarity

/**
 * Convert meters to degrees (rough approximation)
 * 1 degree latitude ≈ 111 km
 */
function metersToDegreesDistance(meters) {
    return meters / 111000;
}

/**
 * Calculate Levenshtein distance for string similarity
 */
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
}

/**
 * Calculate similarity percentage (0 to 1)
 */
function calculateStringSimilarity(str1, str2) {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return 1 - distance / maxLen;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Find potential duplicate issues
 */
async function findDuplicates(description, latitude, longitude) {
    try {
        // Only check non-duplicate issues
        const existingIssues = await Issue.find({
            isDuplicate: false,
            latitude: { $exists: true },
            longitude: { $exists: true }
        }).sort({ createdAt: -1 });

        const potentialDuplicates = [];
        const distanceInDegrees = metersToDegreesDistance(LOCATION_RADIUS_METERS);

        for (const issue of existingIssues) {
            // Check location proximity
            const distance = calculateDistance(
                latitude,
                longitude,
                issue.latitude,
                issue.longitude
            );

            if (distance <= LOCATION_RADIUS_METERS) {
                // Check description similarity
                const similarity = calculateStringSimilarity(description, issue.description);

                if (similarity >= DESCRIPTION_SIMILARITY_THRESHOLD) {
                    potentialDuplicates.push({
                        issue,
                        similarity,
                        distance
                    });
                }
            }
        }

        return potentialDuplicates.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
        console.error("Error finding duplicates:", error);
        return [];
    }
}

/**
 * Link a new issue to an existing duplicate
 */
async function linkDuplicate(newIssueId, duplicateOfId, citizenId) {
    try {
        const masterIssue = await Issue.findById(duplicateOfId);
        if (!masterIssue) throw new Error("Master issue not found");

        // Update the new issue as a duplicate
        await Issue.findByIdAndUpdate(
            newIssueId,
            {
                isDuplicate: true,
                duplicateOf: duplicateOfId,
                reportCount: 0
            },
            { new: true }
        );

        // Add reporter to master issue and increment count
        await Issue.findByIdAndUpdate(
            duplicateOfId,
            {
                $inc: { reportCount: 1 },
                $push: {
                    reporters: {
                        citizenId,
                        reportedAt: new Date()
                    }
                }
            },
            { new: true }
        );

        return { success: true, masterIssueId: duplicateOfId };
    } catch (error) {
        console.error("Error linking duplicate:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Process issue upload with deduplication
 */
async function processIssueUpload(issueData) {
    try {
        const { description, citizenId, latitude, longitude, imagePath, userType, address, category, severity, location } = issueData;

        // If no location provided, just create the issue
        if (!latitude || !longitude) {
            const newIssue = new Issue({
                description,
                citizenId,
                userType,
                imagePath,
                category,
                severity,
                location,
                status: "In Progress"
            });
            await newIssue.save();
            return {
                success: true,
                isDuplicate: false,
                issue: newIssue,
                message: "Issue created (location not available for deduplication)"
            };
        }

        // Find potential duplicates
        const duplicates = await findDuplicates(description, latitude, longitude);

        if (duplicates.length > 0) {
            const masterIssue = duplicates[0].issue;
            
            // Create the new issue but mark it as duplicate
            const newIssue = new Issue({
                description,
                citizenId,
                userType,
                imagePath,
                latitude,
                longitude,
                address,
                category,
                severity,
                location,
                isDuplicate: true,
                duplicateOf: masterIssue._id,
                status: "In Progress"
            });
            await newIssue.save();

            // Add reporter to master issue
            masterIssue.reportCount += 1;
            masterIssue.reporters.push({
                citizenId,
                reportedAt: new Date()
            });
            await masterIssue.save();

            return {
                success: true,
                isDuplicate: true,
                issue: newIssue,
                masterIssueId: masterIssue._id,
                newIssueId: newIssue._id,
                similarity: duplicates[0].similarity,
                distance: duplicates[0].distance,
                reportCount: masterIssue.reportCount,
                message: `Duplicate detected! This is similar to issue ${masterIssue._id} (${(duplicates[0].similarity * 100).toFixed(1)}% match)`
            };
        }

        // No duplicates found, create new issue
        const newIssue = new Issue({
            description,
            citizenId,
            userType,
            imagePath,
            latitude,
            longitude,
            address,
            category,
            severity,
            location,
            status: "In Progress"
        });
        await newIssue.save();

        return {
            success: true,
            isDuplicate: false,
            issue: newIssue,
            message: "New issue created"
        };
    } catch (error) {
        console.error("Error processing issue upload:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get main issue with all duplicate reports
 */
async function getIssueWithDuplicates(issueId) {
    try {
        const mainIssue = await Issue.findById(issueId).populate("duplicateOf");
        
        if (!mainIssue) {
            return { success: false, error: "Issue not found" };
        }

        // If this is a duplicate, get the master
        if (mainIssue.isDuplicate && mainIssue.duplicateOf) {
            return {
                success: true,
                isMasterIssue: false,
                masterIssueId: mainIssue.duplicateOf._id,
                redirectTo: mainIssue.duplicateOf._id
            };
        }

        // This is a master issue, get all duplicates
        const duplicateIssues = await Issue.find({ duplicateOf: issueId });

        return {
            success: true,
            isMasterIssue: true,
            masterIssue: mainIssue,
            duplicateReports: duplicateIssues,
            totalReports: mainIssue.reportCount + 1,
            reporters: mainIssue.reporters
        };
    } catch (error) {
        console.error("Error getting issue with duplicates:", error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    findDuplicates,
    linkDuplicate,
    processIssueUpload,
    getIssueWithDuplicates,
    calculateStringSimilarity,
    calculateDistance
};
