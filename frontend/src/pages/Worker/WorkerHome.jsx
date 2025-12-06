import { useState, useEffect } from "react";
import "./worker.css";
import api from "../../api/config";

export default function WorkerHome() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    resolved: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      console.log("📥 Fetching issues from backend...");
      const response = await api.get("/issues");
      console.log("✅ Issues received:", response.data);
      
      setIssues(response.data || []);
      
      // Calculate stats
      const allIssues = response.data || [];
      setStats({
        assigned: allIssues.length,
        resolved: allIssues.filter(i => i.status === "completed").length,
        pending: allIssues.filter(i => i.status === "pending").length,
        overdue: allIssues.filter(i => i.status === "overdue").length,
      });
    } catch (error) {
      console.error("❌ Error fetching issues:", error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page-wrap">
      {/* Page Title */}
      <h1 className="cd-title">Worker Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid">
        <div className="card">
          <h3 className="cd-card-title">Assigned Issues</h3>
          <p>{stats.assigned}</p>
        </div>
        <div className="card">
          <h3 className="cd-card-title">Resolved Issues</h3>
          <p>{stats.resolved}</p>
        </div>
        <div className="card">
          <h3 className="cd-card-title">Pending Approvals</h3>
          <p>{stats.pending}</p>
        </div>
        <div className="card">
          <h3 className="cd-card-title">Overdue Issues</h3>
          <p>{stats.overdue}</p>
        </div>
      </div>

      {/* Pending Tasks Section */}
      <div className="admin-section">
        <h2>📋 Pending Tasks</h2>
        
        {loading ? (
          <p>Loading tasks...</p>
        ) : issues.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No pending tasks at the moment
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {issues.map((issue) => (
              <div key={issue._id} style={{ 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "15px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                {/* Issue Image */}
                {issue.imagePath && (
                  <img 
                    src={`http://localhost:5000/${issue.imagePath}`}
                    alt="Issue" 
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginBottom: "10px"
                    }}
                  />
                )}

                {/* Issue Details */}
                <div>
                  <h4 style={{ margin: "10px 0", color: "#333" }}>
                    #{issue._id?.toString().slice(-6) || "N/A"}
                  </h4>
                  
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>Category:</strong> {issue.category || "N/A"}
                  </p>
                  
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>Severity:</strong> 
                    <span style={{
                      marginLeft: "8px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: issue.severity === "Severe" ? "#ff6b6b" : issue.severity === "Moderate" ? "#ffa500" : "#4CAF50",
                      color: "white",
                      fontSize: "12px"
                    }}>
                      {issue.severity || "Normal"}
                    </span>
                  </p>
                  
                  <p style={{ margin: "10px 0", fontSize: "14px", lineHeight: "1.5", color: "#555" }}>
                    <strong>Description:</strong> {issue.description || "No description"}
                  </p>

                  {issue.address && (
                    <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>
                      📍 <strong>Location:</strong> {issue.address}
                    </p>
                  )}

                  {issue.reportCount && (
                    <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>
                      👥 <strong>Reported by:</strong> {issue.reportCount} citizen(s)
                    </p>
                  )}

                  {issue.createdAt && (
                    <p style={{ margin: "5px 0", fontSize: "12px", color: "#999" }}>
                      📅 {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  )}

                  {/* Status Badge */}
                  <div style={{ marginTop: "10px" }}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      backgroundColor: issue.isDuplicate ? "#ff9800" : "#2196F3",
                      color: "white"
                    }}>
                      {issue.isDuplicate ? "⚠️ Duplicate" : "🆕 New"}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button style={{
                    marginTop: "10px",
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }} onClick={() => alert(`Assigned to: ${issue._id}`)}>
                    ✅ Accept Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}