import { useState, useEffect, useRef } from "react";
import "../Citizen/Citizen.css";
import api from "../../api/config";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function ReportIssue() {
  const [photo, setPhoto] = useState(null);
  const [severity, setSeverity] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Get GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setGpsLocation({ latitude, longitude });
          console.log("📍 GPS Location:", { latitude, longitude });
          
          // Get address from coordinates
          try {
            const response = await api.get(`/reverse-geocode?lat=${latitude}&lon=${longitude}`);
            if (response.data.address) {
              setLocation(response.data.address);
            }
          } catch (error) {
            console.log("Could not fetch address automatically");
          }
        },
        (error) => {
          console.log("⚠️ GPS Error:", error.message);
        }
      );
    }
  }, []);

  // Initialize and update map
  useEffect(() => {
    if (mapRef.current && gpsLocation) {
      if (!mapInstanceRef.current) {
        // Create map instance
        const map = L.map(mapRef.current).setView(
          [gpsLocation.latitude, gpsLocation.longitude],
          15
        );

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);

        // Handle map clicks to set location
        map.on("click", async (e) => {
          const { lat, lng } = e.latlng;
          setGpsLocation({ latitude: lat, longitude: lng });

          // Get address
          try {
            const response = await api.get(`/reverse-geocode?latitude=${lat}&longitude=${lng}`);
            if (response.data.address) {
              setLocation(response.data.address);
            }
          } catch (error) {
            console.log("Could not fetch address for clicked location");
          }
        });
      }

      // Update or create marker at current location
      const map = mapInstanceRef.current;
      if (markerRef.current) {
        markerRef.current.setLatLng([gpsLocation.latitude, gpsLocation.longitude]);
      } else {
        const marker = L.marker([gpsLocation.latitude, gpsLocation.longitude])
          .addTo(map)
          .bindPopup("📍 Current Location");
        markerRef.current = marker;
      }

      // Center map on location
      map.setView([gpsLocation.latitude, gpsLocation.longitude], 15);

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerRef.current = null;
        }
      };
    }
  }, [gpsLocation]);

  const handleSubmit = async () => {
    if (!severity) {
      alert("Please select a severity before submitting.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (!description) {
      alert("Please describe the issue.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("category", category);
      formData.append("severity", severity);
      formData.append("location", location);
      formData.append("latitude", gpsLocation?.latitude || 0);
      formData.append("longitude", gpsLocation?.longitude || 0);
      formData.append("citizenId", localStorage.getItem("citizenId") || "anonymous");
      formData.append("userType", "citizen");
      if (photo) {
        formData.append("image", photo);
      }

      console.log("📤 Sending to backend...");
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Response:", response.data);

      if (response.data.isDuplicate) {
        alert(`⚠️ Duplicate Issue Detected!\n${response.data.message}\nReported ${response.data.reportCount} times`);
      } else {
        alert(`✅ Issue submitted successfully!\nCategory: ${category}\nSeverity: ${severity}`);
      }

      // Reset form
      setPhoto(null);
      setSeverity("");
      setLocation("");
      setCategory("");
      setDescription("");
    } catch (error) {
      console.error("❌ Error:", error);
      console.error("❌ Error Message:", error.message);
      console.error("❌ Error Response:", error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || "Failed to submit issue. Please try again.";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <h2>Report an Issue</h2>

      {/* Map Container */}
      {gpsLocation && (
        <div style={{
          width: "100%",
          height: "300px",
          marginBottom: "20px",
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #ddd",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div 
            ref={mapRef} 
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}

      <div className="card form-card">
        <input 
          type="file" 
          onChange={(e) => setPhoto(e.target.files[0])} 
          accept="image/*"
          disabled={loading}
        />

        <input 
          className="input" 
          type="text" 
          placeholder="Location / Landmark" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={loading}
        />

        {gpsLocation && (
          <p style={{ fontSize: "12px", color: "#666" }}>
            📍 GPS: {gpsLocation.latitude.toFixed(4)}, {gpsLocation.longitude.toFixed(4)}
          </p>
        )}

        <select 
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
        >
          <option value="">Select Category</option>
          <option value="Pothole">Pothole</option>
          <option value="Garbage Overflow">Garbage Overflow</option>
          <option value="Drainage Block">Drainage Block</option>
          <option value="Streetlight Not Working">Streetlight Not Working</option>
          <option value="Streetdogs issues">Streetdogs issues</option>
        </select>

        <textarea 
          className="input" 
          placeholder="Describe the issue"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        ></textarea>

        <div className="severity-buttons">
          <button
            className={`severity-btn ${severity === "Mild" ? "active" : ""}`}
            onClick={() => setSeverity("Mild")}
            disabled={loading}
          >
            Mild
          </button>
          <button
            className={`severity-btn ${severity === "Moderate" ? "active" : ""}`}
            onClick={() => setSeverity("Moderate")}
            disabled={loading}
          >
            Moderate
          </button>
          <button
            className={`severity-btn ${severity === "Severe" ? "active" : ""}`}
            onClick={() => setSeverity("Severe")}
            disabled={loading}
          >
            Severe
          </button>
        </div>

        <button 
          className="btn" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Issue"}
        </button>
      </div>
    </div>
  );
}