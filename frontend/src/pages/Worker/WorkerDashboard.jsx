import { useEffect, useState } from "react";
import axios from "axios";
import "./Worker.css";

export default function WorkerDashboard() {
  const [issues, setIssues] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get("/api/issues");
        console.log("Fetched issues:", res.data);
        const filtered = res.data.filter(issue => issue.status !== "Completed");
        setIssues(filtered);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    };
    fetchIssues();
  }, []);

  const handleComplete = async (issueId) => {
    if (!file) return alert("Select a completion image!");

    const formData = new FormData();
    formData.append("workerImage", file);

    try {
      await axios.post(`/api/update/${issueId}`, formData);
      alert("Issue marked completed!");
      setFile(null);
      // Refresh issues
      const res = await axios.get("/api/issues");
      setIssues(res.data.filter(issue => issue.status !== "Completed"));
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="worker-container">
      <h2 className="page-title">Worker Dashboard</h2>

      <div className="worker-dashboard-wrapper">
        {/* Keep your donut chart UI here */}
        <div className="donut-chart">
          <svg width="180" height="180" viewBox="0 0 36 36">
            <path
              className="circle pothole-stroke"
              strokeDasharray="40, 100"
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
            />
            <path
              className="circle garbage-stroke"
              strokeDasharray="25, 100"
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
            />
            <path
              className="circle lights-stroke"
              strokeDasharray="11, 100"
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
            />
          </svg>
          <div className="donut-center">76%</div>
        </div>
      </div>

      {/* New functionality: show citizen issues */}
      <div style={{ marginTop: "30px" }}>
        <h3>Pending Issues</h3>
        {issues.length === 0 && <p>No pending issues</p>}
        {issues.map((issue) => (
          <div key={issue._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <p><b>ID:</b> {issue._id}</p>
            <p><b>Description:</b> {issue.description}</p>
            <p><b>Status:</b> {issue.status}</p>
            <p><b>Image Path:</b> {issue.imagePath}</p>
            {issue.imagePath && (
              <>
                <p><b>Image:</b></p>
                <img 
                  src={`/${issue.imagePath}`} 
                  alt="Issue" 
                  width={200}
                  style={{ maxWidth: "100%", height: "auto", border: "1px solid red" }}
                  onError={(e) => console.error("Image load failed for:", e.currentTarget.src)}
                  onLoad={() => console.log("Image loaded successfully:", `/${issue.imagePath}`)}
                />
              </>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button onClick={() => handleComplete(issue._id)}>Mark Completed</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
