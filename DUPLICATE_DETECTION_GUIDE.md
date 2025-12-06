# Duplicate Issue Detection System - Implementation Guide

## Problem Solved
When multiple citizens report the same issue (e.g., pothole on Main Street), the worker receives duplicate tasks, wasting time and resources. This system automatically detects and deduplicates issues.

---

## Solution Overview

### **Architecture**
```
Citizen Reports Issue
        ↓
  [Get User Location]
        ↓
  [Reverse Geocode] → Get Address via Nominatim API
        ↓
  [Deduplication Service] → Check for similar issues nearby
        ↓
  [Two Outcomes]:
    1. NEW ISSUE → Create issue, mark as main issue
    2. DUPLICATE → Link to existing issue, increment reporter count
        ↓
  Worker sees only MAIN issues (no duplicates)
```

---

## Step-by-Step Implementation

### **1. Database Schema Updates (COMPLETED)**
**File:** `backend/models/Issue.js`

New fields added:
```javascript
latitude: Number,              // GPS coordinates
longitude: Number,
address: String,               // Reverse geocoded address
isDuplicate: Boolean,          // Flag if this is a duplicate report
duplicateOf: ObjectId,         // Reference to main issue
reportCount: Number,           // Count of duplicate reports
reporters: [{                  // Array of all reporters
  citizenId: String,
  reportedAt: Date
}]
```

### **2. Deduplication Service (COMPLETED)**
**File:** `backend/services/deduplicationService.js`

**Key Functions:**

#### `findDuplicates(description, latitude, longitude)`
- Checks all main issues within 50 meters radius
- Compares descriptions using Levenshtein distance
- Returns matching issues sorted by similarity
- Threshold: 60% text similarity

**Algorithm:**
```
For each existing main issue:
  1. Calculate distance between coordinates (Haversine formula)
  2. If distance ≤ 50 meters:
     - Calculate text similarity (Levenshtein distance)
     - If similarity ≥ 60%: Add to matches
  3. Return sorted by highest similarity
```

#### `processIssueUpload(issueData)`
- Main function called when citizen uploads issue
- Finds duplicates
- Creates either main or duplicate issue
- Updates reporter tracking

#### `getIssueWithDuplicates(issueId)`
- Returns main issue + all duplicate reports
- Shows total reporters and their info

### **3. Location Service (COMPLETED)**
**File:** `backend/services/locationService.js`

**API Used:** OpenStreetMap Nominatim Reverse Geocoding
- **Free:** No API key needed
- **Endpoint:** `https://nominatim.openstreetmap.org/reverse`
- **Rate Limit:** 1 request/second (built-in delays if needed)

**Function:** `getAddressFromCoordinates(latitude, longitude)`
```
Input:  GPS coordinates (e.g., 40.7128, -74.0060)
Output: {
  success: true,
  address: { road, city, state, postcode, country },
  displayName: "5 Avenue of the Americas, New York, NY 10020, USA",
  formatted: "5 Avenue of the Americas, Manhattan, New York, NY 10020, USA"
}
```

### **4. Updated API Endpoints**

#### **POST /api/upload** (Updated)
```javascript
// Request Body
{
  image: File,           // Image file
  description: String,   // Issue description
  latitude: number,      // GPS latitude
  longitude: number,     // GPS longitude
  citizenId: String,    // Optional user ID
  userType: String      // "citizen" or other
}

// Response - NEW Issue
{
  success: true,
  isDuplicate: false,
  issue: { _id, description, latitude, longitude, ... },
  message: "New issue created"
}

// Response - DUPLICATE Detected
{
  success: true,
  isDuplicate: true,
  masterIssueId: ObjectId,
  newIssueId: ObjectId,
  similarity: 0.85,           // 85% similar
  distance: 25.5,             // 25.5 meters away
  reportCount: 3,             // 3 total reports now
  message: "Duplicate detected! Similar to issue XYZ (85% match)"
}
```

#### **GET /api/issues** (Updated)
Returns only main issues (not duplicates) with reporter count
```javascript
[
  {
    _id: ObjectId,
    description: "Pothole on Main St",
    latitude: 40.7128,
    longitude: -74.0060,
    isDuplicate: false,
    reportCount: 1,
    totalReporters: 4,  // 1 main + 3 duplicates
    status: "In Progress",
    ...
  }
]
```

#### **GET /api/issue/:id** (NEW)
Get issue details with duplicate information
```javascript
// For MAIN issue:
{
  success: true,
  isMasterIssue: true,
  masterIssue: { ... },
  duplicateReports: [ ... ],      // All duplicate reports
  totalReports: 4,                // Count of all reports
  reporters: [
    { citizenId: "user1", reportedAt: "2024-01-01T10:00:00Z" },
    { citizenId: "user2", reportedAt: "2024-01-01T10:15:00Z" }
  ]
}

// For DUPLICATE issue:
{
  success: true,
  isMasterIssue: false,
  masterIssueId: ObjectId,        // Reference to main issue
  redirectTo: ObjectId
}
```

#### **GET /api/all-issues** (NEW)
Returns all main issues for admin/dashboard
```javascript
[
  { _id, description, isDuplicate: false, reportCount, ... }
]
```

### **5. Frontend Updates (COMPLETED)**
**File:** `frontend/src/pages/Citizen/ReportIssue.jsx`

**New Features:**
- ✅ Automatic GPS location capture on page load
- ✅ Reverse geocoding to display address
- ✅ Shows duplicate alert if detected
- ✅ Displays similarity percentage and distance
- ✅ Shows total report count
- ✅ Better UI with location display

**Flow:**
```jsx
1. Component mounts
   → useEffect triggers navigator.geolocation.getCurrentPosition()
2. GPS permission prompt shown to user
3. If granted: Get coordinates + reverse geocode address
4. User fills description + uploads image
5. On submit: POST /api/upload with coordinates
6. Response shows:
   - ✅ NEW: "Issue submitted successfully"
   - ⚠️ DUPLICATE: Shows similarity, distance, report count
```

---

## How It Works (Example Scenario)

### **Scenario: Pothole on Main Street**

**Time 10:00** - Citizen A reports
```
Location: 40.7128, -74.0060 (Main St, NY)
Description: "Deep pothole dangerous for vehicles"
Image: pothole1.jpg

Result: ✅ New issue created (_id: issue_123)
Workers see: 1 new issue to fix
```

**Time 10:15** - Citizen B reports same pothole
```
Location: 40.7130, -74.0062 (25m away)
Description: "Big hole in the road, very deep"
Image: pothole2.jpg

Deduplication Check:
  ✓ Distance: 25m (< 50m threshold)
  ✓ Text similarity: 78% (> 60% threshold)
  
Result: ⚠️ Duplicate of issue_123
  - New issue created (_id: issue_456, isDuplicate: true)
  - Links to issue_123
  - issue_123.reportCount: 2
  - issue_123.reporters: [{ citizenId: "B", time: 10:15 }]

Workers see: STILL 1 issue to fix (not 2!)
Dashboard shows: "Pothole - Reported 2 times"
```

**Time 10:30** - Citizen C reports
```
Similar issue within 50m and 60% text match
Result: ⚠️ Linked to issue_123
Workers see: STILL 1 issue
Dashboard shows: "Pothole - Reported 3 times"
```

---

## Configuration & Customization

### **Adjust Deduplication Sensitivity**
**File:** `backend/services/deduplicationService.js`

```javascript
// Line 1-2: Adjust these values
const LOCATION_RADIUS_METERS = 50;           // Change radius
const DESCRIPTION_SIMILARITY_THRESHOLD = 0.6; // 0.6 = 60% similarity
```

**Examples:**
```
LOCATION_RADIUS_METERS = 30   // Stricter (only very close issues)
LOCATION_RADIUS_METERS = 100  // Looser (group issues in wider area)

DESCRIPTION_SIMILARITY_THRESHOLD = 0.8  // Stricter (exact matches only)
DESCRIPTION_SIMILARITY_THRESHOLD = 0.5  // Looser (more grouping)
```

---

## Testing Instructions

### **1. Test with Frontend (Recommended)**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev

# Open http://localhost:5173
# Go to Report Issue page
# Allow location access
# Submit first issue
# Submit second similar issue
# See deduplication alert
```

### **2. Test with cURL (For API testing)**
```bash
# Test 1: Create main issue
curl -X POST http://localhost:5000/api/upload \
  -F "image=@pothole1.jpg" \
  -F "description=Deep pothole on Main Street" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060"

# Test 2: Create duplicate
curl -X POST http://localhost:5000/api/upload \
  -F "image=@pothole2.jpg" \
  -F "description=Big hole in the road" \
  -F "latitude=40.7130" \
  -F "longitude=-74.0062"

# Get issue details
curl http://localhost:5000/api/issue/{issue_id}

# Get all issues (only mains)
curl http://localhost:5000/api/issues
```

---

## Performance Considerations

| Factor | Impact | Optimization |
|--------|--------|---------------|
| **Database Queries** | O(n) for each upload | Add indices on `isDuplicate`, `latitude`, `longitude` |
| **String Similarity** | Levenshtein = O(m*n) | Only run if distance check passes |
| **Nominatim API** | ~200ms per call | Cache results for 1 hour |
| **Multiple uploads** | Could be slow | Add queue system (Bull, RabbitMQ) |

### **Database Indexing** (Optional but recommended)
```javascript
// Add to Issue model
IssueSchema.index({ isDuplicate: 1, createdAt: -1 });
IssueSchema.index({ latitude: 1, longitude: 1 });
IssueSchema.index({ duplicateOf: 1 });
```

---

## Error Handling

### **Common Scenarios**

| Scenario | Handling |
|----------|----------|
| No GPS access | Falls back to non-location-based issues, no deduplication |
| Nominatim timeout | Still creates issue, just without address |
| Database error | Returns 500 with error message |
| Invalid coordinates | Validates coordinates format |

---

## APIs Used

| API | Purpose | Free? | Rate Limit |
|-----|---------|-------|-----------|
| **OpenStreetMap Nominatim** | Reverse geocoding (lat/lon → address) | ✅ Yes | 1/sec |
| **Browser Geolocation API** | Get user's GPS coordinates | ✅ Native | N/A |

---

## What Workers See (Dashboard View)

**Before Integration:**
```
Issue 1: Pothole on Main St (reported by Citizen A)
Issue 2: Deep hole in road (reported by Citizen B)
Issue 3: Dangerous pothole (reported by Citizen C)
Total: 3 issues to fix
```

**After Integration:**
```
Issue 1: Pothole on Main St
  └─ Reported by: 3 citizens
     • Citizen A - 10:00 AM
     • Citizen B - 10:15 AM
     • Citizen C - 10:30 AM
Total: 1 issue to fix (but 3 reports)
```

---

## Next Steps / Future Enhancements

1. **Image-based deduplication** - Use image hashing (pHash) to detect similar images
2. **Time-based deduplication** - Consider issue age (old issues shouldn't match new ones)
3. **Mobile app support** - Native location access
4. **WebSocket notifications** - Real-time duplicate alerts
5. **Machine Learning** - Improved description matching
6. **Analytics Dashboard** - Show duplicate patterns
7. **Batch processing** - For handling many uploads

---

## Troubleshooting

**Issue: "Location unavailable" on frontend**
- Solution: Check if HTTPS is used (geolocation requires HTTPS in production)
- Local: Localhost works without HTTPS

**Issue: Duplicate not detected**
- Check: Distance > 50m or similarity < 60%
- Solution: Adjust thresholds in deduplicationService.js

**Issue: Nominatim API timeout**
- Check: Internet connection
- Solution: Add retry logic with exponential backoff

---

## Summary

✅ **Implemented:**
- Duplicate detection system
- Location tracking (GPS)
- Reverse geocoding (Nominatim API)
- Reporter tracking
- Worker sees only main issues
- Frontend shows duplicate alerts

🎯 **Result:** Workers get unique issues, not duplicates. Citizens see if their report matched an existing issue.
