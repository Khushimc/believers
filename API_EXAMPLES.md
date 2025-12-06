# API Examples & Testing Guide

## Complete API Reference with Examples

---

## 1️⃣ POST /api/upload - Create/Duplicate Issue

### **Request**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@pothole.jpg" \
  -F "description=Deep pothole on Main Street near the bank" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "citizenId=user123" \
  -F "userType=citizen"
```

### **Response Example 1: NEW ISSUE**
```json
{
  "success": true,
  "isDuplicate": false,
  "issue": {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Deep pothole on Main Street near the bank",
    "citizenId": "user123",
    "userType": "citizen",
    "imagePath": "uploads/1702986000000-pothole.jpg",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "Main Street, Manhattan, New York, NY 10020, USA",
    "status": "In Progress",
    "isDuplicate": false,
    "reportCount": 1,
    "reporters": [],
    "createdAt": "2024-12-19T10:00:00.000Z"
  },
  "message": "New issue created"
}
```

### **Response Example 2: DUPLICATE FOUND**
```json
{
  "success": true,
  "isDuplicate": true,
  "masterIssueId": "507f1f77bcf86cd799439011",
  "newIssueId": "507f191e110fb57d6294e1a2",
  "similarity": 0.85,
  "distance": 24.5,
  "reportCount": 3,
  "message": "Duplicate detected! This is similar to issue 507f1f77bcf86cd799439011 (85.0% match)"
}
```

### **Response Example 3: NO GPS (Fallback)**
```json
{
  "success": true,
  "isDuplicate": false,
  "issue": {
    "_id": "507f191e110fb57d6294e1a3",
    "description": "Road damage on Center St",
    "citizenId": "user456",
    "imagePath": "uploads/1702986100000-damage.jpg",
    "latitude": null,
    "longitude": null,
    "address": null,
    "status": "In Progress",
    "isDuplicate": false,
    "reportCount": 1,
    "createdAt": "2024-12-19T10:05:00.000Z"
  },
  "message": "Issue created (location not available for deduplication)"
}
```

### **Error Response**
```json
{
  "message": "Image required",
  "error": "No image file in request"
}
```

---

## 2️⃣ GET /api/issues - Get Pending Issues (Main Only)

### **Request**
```bash
curl http://localhost:5000/api/issues
```

### **Response**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Deep pothole on Main Street",
    "citizenId": "user123",
    "imagePath": "uploads/1702986000000-pothole.jpg",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "Main Street, Manhattan, New York, NY 10020, USA",
    "status": "In Progress",
    "isDuplicate": false,
    "reportCount": 2,
    "totalReporters": 3,
    "reporters": [
      {
        "citizenId": "user124",
        "reportedAt": "2024-12-19T10:15:00.000Z"
      },
      {
        "citizenId": "user125",
        "reportedAt": "2024-12-19T10:30:00.000Z"
      }
    ],
    "createdAt": "2024-12-19T10:00:00.000Z"
  },
  {
    "_id": "507f191e110fb57d6294e1a4",
    "description": "Broken street light at intersection",
    "citizenId": "user200",
    "imagePath": "uploads/1702987000000-light.jpg",
    "latitude": 40.7180,
    "longitude": -74.0070,
    "status": "In Progress",
    "isDuplicate": false,
    "reportCount": 0,
    "totalReporters": 1,
    "reporters": [],
    "createdAt": "2024-12-19T11:00:00.000Z"
  }
]
```

---

## 3️⃣ GET /api/issue/:id - Get Issue Details with Duplicates

### **Request - MAIN ISSUE**
```bash
curl http://localhost:5000/api/issue/507f1f77bcf86cd799439011
```

### **Response - MAIN ISSUE**
```json
{
  "success": true,
  "isMasterIssue": true,
  "masterIssue": {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Deep pothole on Main Street",
    "citizenId": "user123",
    "imagePath": "uploads/1702986000000-pothole.jpg",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "Main Street, Manhattan, New York, NY 10020, USA",
    "status": "In Progress",
    "isDuplicate": false,
    "reportCount": 2,
    "reporters": [
      {
        "citizenId": "user124",
        "reportedAt": "2024-12-19T10:15:00.000Z"
      },
      {
        "citizenId": "user125",
        "reportedAt": "2024-12-19T10:30:00.000Z"
      }
    ],
    "createdAt": "2024-12-19T10:00:00.000Z"
  },
  "duplicateReports": [
    {
      "_id": "507f191e110fb57d6294e1a2",
      "description": "Big hole in the road near Main Street",
      "citizenId": "user124",
      "imagePath": "uploads/1702986100000-hole.jpg",
      "latitude": 40.7130,
      "longitude": -74.0062,
      "isDuplicate": true,
      "duplicateOf": "507f1f77bcf86cd799439011",
      "status": "In Progress",
      "createdAt": "2024-12-19T10:15:00.000Z"
    },
    {
      "_id": "507f191e110fb57d6294e1a3",
      "description": "Dangerous pothole blocking traffic",
      "citizenId": "user125",
      "imagePath": "uploads/1702986200000-danger.jpg",
      "latitude": 40.7132,
      "longitude": -74.0061,
      "isDuplicate": true,
      "duplicateOf": "507f1f77bcf86cd799439011",
      "status": "In Progress",
      "createdAt": "2024-12-19T10:30:00.000Z"
    }
  ],
  "totalReports": 3,
  "reporters": [
    {
      "citizenId": "user123",
      "reportedAt": "2024-12-19T10:00:00.000Z"
    },
    {
      "citizenId": "user124",
      "reportedAt": "2024-12-19T10:15:00.000Z"
    },
    {
      "citizenId": "user125",
      "reportedAt": "2024-12-19T10:30:00.000Z"
    }
  ]
}
```

### **Request - DUPLICATE ISSUE**
```bash
curl http://localhost:5000/api/issue/507f191e110fb57d6294e1a2
```

### **Response - DUPLICATE ISSUE**
```json
{
  "success": true,
  "isMasterIssue": false,
  "masterIssueId": "507f1f77bcf86cd799439011",
  "redirectTo": "507f1f77bcf86cd799439011"
}
```

---

## 4️⃣ GET /api/all-issues - Get All Main Issues

### **Request**
```bash
curl http://localhost:5000/api/all-issues
```

### **Response**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Deep pothole on Main Street",
    "status": "In Progress",
    "isDuplicate": false,
    "reportCount": 2,
    "createdAt": "2024-12-19T10:00:00.000Z"
  },
  {
    "_id": "507f191e110fb57d6294e1a4",
    "description": "Broken street light",
    "status": "In Progress",
    "isDuplicate": false,
    "reportCount": 0,
    "createdAt": "2024-12-19T11:00:00.000Z"
  }
]
```

---

## 5️⃣ POST /api/update/:id - Mark Issue Complete

### **Request**
```bash
curl -X POST http://localhost:5000/api/update/507f1f77bcf86cd799439011 \
  -F "workerImage=@fixed.jpg" \
  -F "workerId=worker456"
```

### **Response**
```json
{
  "message": "Issue updated",
  "issue": {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Deep pothole on Main Street",
    "status": "Completed",
    "workerImagePath": "uploads/1702990000000-fixed.jpg",
    "workerId": "worker456",
    "completedAt": "2024-12-19T12:00:00.000Z"
  }
}
```

---

## 6️⃣ POST /api/feedback/:id - Submit Feedback

### **Request**
```bash
curl -X POST http://localhost:5000/api/feedback/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"feedback": "done"}'
```

### **Response**
```json
{
  "message": "Feedback submitted",
  "issue": {
    "_id": "507f1f77bcf86cd799439011",
    "feedback": "done",
    "status": "Verified"
  }
}
```

---

## 📊 Testing Scenario: Complete Workflow

### **Step 1: Citizen A Reports Issue**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@pothole1.jpg" \
  -F "description=Deep pothole on Main Street dangerous" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "citizenId=citizen_a"
```

**Response:** `{ isDuplicate: false, issue: { _id: "issue_1", ... } }`

---

### **Step 2: Citizen B Reports Same Issue (Duplicate)**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@pothole2.jpg" \
  -F "description=Big hole in road very deep" \
  -F "latitude=40.7130" \
  -F "longitude=-74.0062" \
  -F "citizenId=citizen_b"
```

**Response:** `{ isDuplicate: true, masterIssueId: "issue_1", similarity: 0.82, distance: 24.5 }`

---

### **Step 3: Citizen C Reports Same Issue (Another Duplicate)**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@pothole3.jpg" \
  -F "description=Dangerous pothole needs repair" \
  -F "latitude=40.7132" \
  -F "longitude=-74.0061" \
  -F "citizenId=citizen_c"
```

**Response:** `{ isDuplicate: true, masterIssueId: "issue_1", similarity: 0.79, distance: 18.3 }`

---

### **Step 4: Worker Views Pending Issues**
```bash
curl http://localhost:5000/api/issues
```

**Response:**
```json
[
  {
    "_id": "issue_1",
    "description": "Deep pothole on Main Street dangerous",
    "isDuplicate": false,
    "reportCount": 2,
    "totalReporters": 3,
    "reporters": [
      { "citizenId": "citizen_b", "reportedAt": "2024-12-19T10:15:00Z" },
      { "citizenId": "citizen_c", "reportedAt": "2024-12-19T10:30:00Z" }
    ]
  }
]
```

**Key Point:** Worker sees 1 issue, not 3!

---

### **Step 5: Worker Gets Issue Details**
```bash
curl http://localhost:5000/api/issue/issue_1
```

**Response:** Shows all 3 reports (original + 2 duplicates)

---

### **Step 6: Worker Completes Issue**
```bash
curl -X POST http://localhost:5000/api/update/issue_1 \
  -F "workerImage=@fixed.jpg" \
  -F "workerId=worker_123"
```

**Result:** Issue marked complete. All 3 citizens notified (in real app).

---

## 🔧 JavaScript/Axios Examples

### **Frontend: Upload Issue with Duplicate Check**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("image", file);
  formData.append("description", description);
  formData.append("latitude", location.latitude);
  formData.append("longitude", location.longitude);
  formData.append("citizenId", userId);
  formData.append("userType", "citizen");

  try {
    const response = await axios.post("/api/upload", formData);

    if (response.data.isDuplicate) {
      alert(
        `⚠️ Duplicate Found!\n` +
        `Similarity: ${(response.data.similarity * 100).toFixed(1)}%\n` +
        `Distance: ${response.data.distance.toFixed(1)}m\n` +
        `Total Reports: ${response.data.reportCount}`
      );
    } else {
      alert("✅ New issue created!");
    }
  } catch (error) {
    alert("Error: " + error.response.data.message);
  }
};
```

### **Frontend: Fetch Issue with Reports**
```javascript
const fetchIssueDetails = async (issueId) => {
  try {
    const response = await axios.get(`/api/issue/${issueId}`);
    
    if (!response.data.isMasterIssue) {
      // This is a duplicate, redirect
      window.location.href = `/issue/${response.data.masterIssueId}`;
      return;
    }

    // Show main issue with all reports
    console.log("Total Reports:", response.data.totalReporters);
    console.log("Reporters:", response.data.reporters);
    console.log("Duplicate Reports:", response.data.duplicateReports);
  } catch (error) {
    console.error("Error fetching issue:", error);
  }
};
```

### **Backend: Custom Deduplication Check**
```javascript
const { processIssueUpload } = require("../services/deduplicationService");

// Usage in controller
const result = await processIssueUpload({
  description: "Pothole on Main Street",
  citizenId: "user123",
  latitude: 40.7128,
  longitude: -74.0060,
  imagePath: "uploads/image.jpg",
  userType: "citizen"
});

if (result.isDuplicate) {
  console.log(`Linked to issue: ${result.masterIssueId}`);
  console.log(`Similarity: ${(result.similarity * 100).toFixed(1)}%`);
}
```

---

## 📈 Mock Data Generator (Testing)

```javascript
// Generate test issues for testing
const generateTestData = async () => {
  const issues = [
    {
      description: "Pothole on Main Street",
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      description: "Big hole in road",
      latitude: 40.7129,
      longitude: -74.0061
    },
    {
      description: "Broken street light",
      latitude: 40.7150,
      longitude: -74.0050
    },
    {
      description: "Garbage overflow",
      latitude: 40.7110,
      longitude: -74.0080
    }
  ];

  for (let i = 0; i < issues.length; i++) {
    const formData = new FormData();
    formData.append("image", testImageBlob);
    formData.append("description", issues[i].description);
    formData.append("latitude", issues[i].latitude);
    formData.append("longitude", issues[i].longitude);
    
    await axios.post("/api/upload", formData);
  }
};
```

---

## ✅ Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | Success | Issue created, fetched |
| **400** | Bad Request | Missing required field |
| **404** | Not Found | Issue ID doesn't exist |
| **500** | Server Error | Database error |

---

## 🚨 Common Issues & Solutions

### **Issue: "Location unavailable" in frontend**
```javascript
// Solution: Check HTTPS and permissions
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    success,
    error,
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}
```

### **Issue: Duplicates not detected**
```
Reasons:
1. Distance > 50m (adjust: LOCATION_RADIUS_METERS = 100)
2. Similarity < 60% (adjust: DESCRIPTION_SIMILARITY_THRESHOLD = 0.5)
3. No previous issues to match against
```

### **Issue: Nominatim API timeout**
```javascript
// Add retry logic
async function getAddressWithRetry(lat, lon, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await getAddressFromCoordinates(lat, lon);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## 📚 Environment Variables (Optional)

```bash
# .env file
NOMINATIM_TIMEOUT=5000
LOCATION_RADIUS=50
TEXT_SIMILARITY_THRESHOLD=0.6
NODE_ENV=development
```

---

This completes the API reference guide. Test each endpoint to ensure everything works as expected!
