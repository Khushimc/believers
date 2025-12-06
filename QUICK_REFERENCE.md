# Quick Reference - Duplicate Detection System

## 📋 What Was Implemented?

A **smart duplicate detection system** that prevents workers from seeing the same issue multiple times when different citizens report it.

---

## 🎯 How It Works (Simple Version)

```
Citizen 1 reports "Pothole on Main St"
        ↓
System: "Is this a new issue?"
  • Check coordinates (GPS location)
  • Check description similarity
  • Search 50m radius for similar issues
        ↓
Result: ✅ NEW ISSUE
Workers see 1 issue
        ↓
Citizen 2 reports "Big hole in road" (nearby)
        ↓
System: "Similar to existing issue?"
  • Same location (25m away) ✓
  • Similar description (80% match) ✓
        ↓
Result: ⚠️ DUPLICATE
  • Links to Citizen 1's issue
  • Workers STILL see only 1 issue
  • But system shows "Reported 2 times"
```

---

## 📱 Frontend Changes

### **ReportIssue.jsx - New Features**

```jsx
✅ Auto-captures GPS location on page load
✅ Shows address (reverse geocoding from Nominatim API)
✅ When duplicate detected:
   • Shows similarity % (e.g., "85% similar")
   • Shows distance (e.g., "25 meters away")
   • Shows report count (e.g., "Now reported 3 times")
✅ Continues to allow submission (for tracking reports)
```

**User Experience:**
```
1. Open "Report Issue" page
2. Browser asks: "Allow location access?" → User clicks "Yes"
3. Page shows: "📍 Lat: 40.7128, Lon: -74.0060"
4. User enters description + uploads photo
5. User clicks "Submit"
6. One of two responses:
   
   Option A: NEW ISSUE
   ✅ "Issue submitted successfully!"
   
   Option B: DUPLICATE FOUND
   ⚠️ "Similar Issue Found!"
       "85% similar to existing issue"
       "25 meters away"
       "Total Reports: 3"
       → Issue still submitted (tracked as duplicate report)
```

---

## 🔧 Backend Changes

### **Database Model Updates**
```javascript
// Issue.js - New fields
latitude: Number,           // GPS coordinates
longitude: Number,
address: String,            // e.g., "Main St, New York"
isDuplicate: Boolean,       // true = duplicate of another issue
duplicateOf: ObjectId,      // Reference to main issue if duplicate
reportCount: Number,        // How many people reported this
reporters: [{               // List of all reporters
  citizenId: String,
  reportedAt: Date
}]
```

### **API Endpoints**

| Endpoint | Method | Purpose | New/Updated |
|----------|--------|---------|------------|
| `/api/upload` | POST | Citizens submit issues | **Updated** |
| `/api/issues` | GET | Get pending issues (mains only) | **Updated** |
| `/api/issue/:id` | GET | Get issue + duplicate info | **NEW** |
| `/api/all-issues` | GET | Get all main issues | **NEW** |
| `/api/update/:id` | POST | Workers mark as complete | Same |
| `/api/feedback/:id` | POST | Citizens give feedback | Same |

### **Key Services Created**

**1. deduplicationService.js**
```javascript
findDuplicates()           // Find similar issues nearby
processIssueUpload()       // Main logic: new or duplicate?
getIssueWithDuplicates()   // Get issue + all reports
calculateStringSimilarity() // 80% match? 60% match?
calculateDistance()        // How far apart (meters)?
```

**2. locationService.js**
```javascript
getAddressFromCoordinates() // Use Nominatim API
formatAddress()            // Convert JSON address to string
```

---

## 🌍 External APIs Used

### **OpenStreetMap Nominatim Reverse Geocoding**
- **Purpose:** Convert GPS coordinates → address
- **Free?** ✅ Yes, completely free
- **No API Key needed** ✅
- **Rate:** 1 request per second
- **URL:** `https://nominatim.openstreetmap.org/reverse`

**Example:**
```
Input:  latitude=40.7128, longitude=-74.0060
Output: "5 Avenue of the Americas, New York, NY 10020, USA"
```

---

## 🔍 Deduplication Algorithm

**When citizen uploads issue:**

```javascript
1. Get GPS location from browser
   Input: User's current latitude, longitude

2. Search for nearby issues
   Query: All main issues within 50 meters
   
3. For each nearby issue:
   a) Calculate text similarity (Levenshtein distance)
   b) If similarity > 60%: Potential duplicate
   
4. If duplicates found:
   → Link new issue to most similar one
   → Increment reportCount
   → Add reporter to list
   
5. If no duplicates:
   → Create new main issue
```

**Thresholds (Configurable):**
- **Location Radius:** 50 meters (change in deduplicationService.js)
- **Text Similarity:** 60% match (change in deduplicationService.js)

---

## 📊 Worker's Dashboard View

### **BEFORE Integration**
```
🔴 Issue #1: Pothole on Main St
🔴 Issue #2: Deep hole in road
🔴 Issue #3: Dangerous pothole
────────────────────────────────
Total: 3 issues to fix
```

### **AFTER Integration**
```
🟢 Issue #1: Pothole on Main St
   📢 Reported by 3 citizens:
      • Citizen A - 10:00 AM
      • Citizen B - 10:15 AM  ← Similar report (80% match, 25m away)
      • Citizen C - 10:30 AM  ← Similar report (75% match, 40m away)
────────────────────────────────
Total: 1 issue to fix (but 3 citizens noticed it)
```

---

## 🚀 How to Test

### **Test 1: Duplicate Detection (Frontend)**
```bash
# Open browser at http://localhost:5173
# Go to "Report Issue" page
# Allow location access
# Submit issue #1: "Pothole on Main St" + photo
# Move slightly (within 50m radius)
# Submit issue #2: "Big hole in road" + similar photo

Expected:
✅ First submission: "Success"
⚠️ Second submission: "Duplicate alert" + similarity info
```

### **Test 2: API Testing (cURL)**
```bash
# Create Issue 1
curl -X POST http://localhost:5000/api/upload \
  -F "image=@photo1.jpg" \
  -F "description=Pothole on Main Street" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060"

# Response: { success: true, isDuplicate: false, issue: {...} }

# Create Issue 2 (nearby, similar description)
curl -X POST http://localhost:5000/api/upload \
  -F "image=@photo2.jpg" \
  -F "description=Big hole in the road" \
  -F "latitude=40.7130" \
  -F "longitude=-74.0062"

# Response: { success: true, isDuplicate: true, similarity: 0.85, ... }

# View main issue with all reports
curl http://localhost:5000/api/issue/{issueId}
```

---

## 🎛️ Configuration

### **Adjust Duplicate Detection Sensitivity**
**File:** `backend/services/deduplicationService.js`

```javascript
// Line 1-2
const LOCATION_RADIUS_METERS = 50;           // Default: 50m
const DESCRIPTION_SIMILARITY_THRESHOLD = 0.6; // Default: 60%

// Examples:
LOCATION_RADIUS_METERS = 30   // Stricter (only nearby)
LOCATION_RADIUS_METERS = 100  // Looser (larger area)

DESCRIPTION_SIMILARITY_THRESHOLD = 0.8  // Stricter
DESCRIPTION_SIMILARITY_THRESHOLD = 0.5  // Looser
```

---

## 📈 Expected Benefits

| Benefit | Impact |
|---------|--------|
| **Worker Efficiency** | No wasted time on duplicates ⏱️ |
| **Better Prioritization** | High-report issues get priority 📊 |
| **Citizen Engagement** | See if issue is already reported ✅ |
| **Data Quality** | Deduplicated, clean database 📋 |
| **Resource Allocation** | Accurate issue count 🎯 |

---

## 🔄 Data Flow Diagram

```
Citizen App (Frontend)
         ↓
[Get GPS Location]
         ↓
[Form: Description + Image]
         ↓
POST /api/upload
{
  image, description,
  latitude, longitude
}
         ↓
Backend Server
         ↓
[Reverse Geocode] → Nominatim API
         ↓
[Find Duplicates] ← Query MongoDB
         ↓
Decision Tree:
├─→ No Similar Issues Found
│   └─→ Create NEW issue
│       └─→ isDuplicate = false
│
└─→ Similar Issue Found (>60%, <50m)
    └─→ Create DUPLICATE issue
        ├─→ isDuplicate = true
        ├─→ duplicateOf = {mainIssueId}
        └─→ Update main issue:
            ├─→ reportCount++
            └─→ reporters.push(citizenId)
         ↓
Response to Frontend
{
  isDuplicate: true/false,
  similarity: 0.85,
  distance: 25,
  reportCount: 3
}
         ↓
Show Alert to Citizen
```

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Location unavailable"** | Enable GPS permission in browser. Must use HTTPS (localhost works) |
| **Duplicates not detected** | Issues too far (>50m) or descriptions too different (<60% match). Adjust thresholds. |
| **Nominatim API slow** | Normal (200-300ms). Consider caching or using different geocoding service |
| **Duplicate not showing in reports** | Refresh page. Check if issue is actually a duplicate in database. |

---

## 📚 Files Modified/Created

```
backend/
├── models/Issue.js                    ✏️ UPDATED
├── controllers/issueController.js     ✏️ UPDATED
├── routes/issueRoutes.js              ✏️ UPDATED
├── services/
│   ├── deduplicationService.js        ✨ NEW
│   └── locationService.js             ✨ NEW
└── package.json                       ✏️ (added axios)

frontend/
└── src/pages/Citizen/ReportIssue.jsx  ✏️ UPDATED

root/
└── DUPLICATE_DETECTION_GUIDE.md       ✨ NEW (detailed guide)
```

---

## ✅ Quick Checklist

- [x] Database model updated with location + duplicate fields
- [x] Deduplication service created (distance + similarity)
- [x] Location service created (Nominatim reverse geocoding)
- [x] Backend API endpoints updated and new ones added
- [x] Frontend captures GPS location
- [x] Frontend shows duplicate alerts
- [x] Frontend shows similarity % and distance
- [x] axios installed for HTTP requests
- [x] Documentation complete

---

## 🎓 Key Concepts

**Haversine Formula** - Calculate distance between two GPS points
**Levenshtein Distance** - Calculate text similarity (0-100%)
**Reverse Geocoding** - Convert GPS coordinates to addresses
**Geolocation API** - Browser's built-in GPS access

---

## 📞 Summary

You now have a **smart duplicate detection system** that:
- ✅ Prevents workers from seeing duplicate issues
- ✅ Tracks how many citizens reported each issue
- ✅ Uses GPS location + description to detect duplicates
- ✅ Shows citizens when their report matches an existing issue
- ✅ Provides accurate issue counts and priorities

**Workers see: 1 issue (Reported 3 times)**
**Instead of: 3 separate issues**
