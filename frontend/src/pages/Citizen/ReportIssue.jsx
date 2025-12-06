import { useState, useEffect } from "react";
import axios from "axios";

export default function ReportIssue() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.log("Location permission denied:", error.message);
          alert("Please enable location access to report issues");
        }
      );
    }
  }, []);

  // Reverse geocode to get address
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat: lat,
            lon: lon,
            format: "json",
          },
        }
      );
      setAddress(response.data.address.road || response.data.display_name);
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return alert("Select an image!");
    if (!description) return alert("Enter a description!");
    if (!location) return alert("Location not available!");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description);
    formData.append("userType", "citizen");
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);

    setLoading(true);
    try {
      const res = await axios.post("/api/upload", formData);
      
      if (res.data.isDuplicate) {
        setIsDuplicate(true);
        setDuplicateInfo(res.data);
        alert(`⚠️ Duplicate Issue Detected!\n\n${res.data.message}\n\nYour report has been added to the existing issue.`);
      } else {
        alert("✅ Issue submitted successfully!");
        setIsDuplicate(false);
      }

      setFile(null);
      setDescription("");
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Upload failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Report an Issue</h2>

      {isDuplicate && duplicateInfo && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <strong>🔔 Similar Issue Found!</strong>
          <p>
            This is {(duplicateInfo.similarity * 100).toFixed(1)}% similar to an existing issue
            {duplicateInfo.distance && ` (${duplicateInfo.distance.toFixed(0)}m away)`}
          </p>
          <p>Your report has been recorded and linked to the main issue.</p>
          <p>
            <strong>Total Reports:</strong> {duplicateInfo.reportCount}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>
            <strong>Location:</strong>
          </label>
          <p>
            {location ? (
              <>
                📍 <strong>Lat:</strong> {location.latitude.toFixed(4)}, <strong>Lon:</strong>{" "}
                {location.longitude.toFixed(4)}
                <br />
                <em>{address || "Getting address..."}</em>
              </>
            ) : (
              <span style={{ color: "red" }}>🔴 Location unavailable</span>
            )}
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            <strong>Issue Description:</strong>
          </label>
          <textarea
            placeholder="Describe the issue (pothole, street light, garbage, etc.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{
              width: "100%",
              height: "120px",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            <strong>Upload Image:</strong>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
            style={{
              display: "block",
              marginTop: "5px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !location}
          style={{
            backgroundColor: loading || !location ? "#ccc" : "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: loading || !location ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </div>
  );
}
