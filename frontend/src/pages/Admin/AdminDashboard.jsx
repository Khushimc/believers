import { useState, useEffect } from "react";
import axios from "axios";
import "../Admin/Admin.css";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([
    { _id: "1", name: "Worker 1", category: "Pothole" },
    { _id: "2", name: "Worker 2", category: "Garbage" },
    { _id: "3", name: "Worker 3", category: "Lights" },
    { _id: "4", name: "Worker 4", category: "Pothole" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");

  const categories = ["All", "Pothole", "Garbage", "Lights", "Other"];

  // Fetch issues from backend
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get("/api/all-issues");
        setIssues(res.data);
        console.log("Fetched issues:", res.data);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    };
    fetchIssues();
  }, []);

  // Filter issues by category
  const filteredIssues = selectedCategory === "All" 
    ? issues 
    : issues.filter(issue => issue.category === selectedCategory);

  // Get worker stats
  const getWorkerStats = (workerId) => {
    const workerIssues = issues.filter(i => i.workerId === workerId);
    return {
      assigned: workerIssues.length,
      completed: workerIssues.filter(i => i.status === "Completed").length,
      pending: workerIssues.filter(i => i.status !== "Completed").length
    };
  };

  // Assign issue to worker
  const handleAssignIssue = async () => {
    if (!selectedIssue || !selectedWorker) {
      alert("Please select an issue and a worker");
      return;
    }

    try {
      await axios.post(`/api/assign/${selectedIssue}`, { workerId: selectedWorker });
      alert("Issue assigned successfully!");
      setSelectedIssue("");
      setSelectedWorker("");
      // Refresh issues
      const res = await axios.get("/api/all-issues");
      setIssues(res.data);
    } catch (err) {
      console.error("Error assigning issue:", err);
      alert("Failed to assign issue");
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Overview Stats */}
      <div className="admin-overview">
        <div className="admin-card">
          <h3>Total Workers</h3>
          <p>{workers.length}</p>
        </div>
        <div className="admin-card">
          <h3>Total Issues</h3>
          <p>{issues.length}</p>
        </div>
        <div className="admin-card">
          <h3>Completed Issues</h3>
          <p>{issues.filter(i => i.status === "Completed").length}</p>
        </div>
        <div className="admin-card">
          <h3>Pending Issues</h3>
          <p>{issues.filter(i => i.status !== "Completed").length}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="admin-section">
        <h2>Filter by Category</h2>
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          Showing {filteredIssues.length} issues in {selectedCategory} category
        </p>
      </div>

      {/* Assign Issues */}
      <div className="admin-section">
        <h2>Assign Issues to Workers</h2>
        <div className="assign-container">
          <div className="assign-field">
            <label>Select Issue:</label>
            <select value={selectedIssue} onChange={(e) => setSelectedIssue(e.target.value)}>
              <option value="">-- Choose Issue --</option>
              {filteredIssues
                .filter(issue => !issue.workerId)
                .map(issue => (
                  <option key={issue._id} value={issue._id}>
                    {issue.description} ({issue.category})
                  </option>
                ))}
            </select>
          </div>

          <div className="assign-field">
            <label>Select Worker:</label>
            <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
              <option value="">-- Choose Worker --</option>
              {workers
                .filter(w => w.category === selectedCategory || selectedCategory === "All")
                .map(worker => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.category})
                  </option>
                ))}
            </select>
          </div>

          <button className="assign-btn" onClick={handleAssignIssue}>
            Assign Issue
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="admin-section">
        <h2>Issues by {selectedCategory} Category</h2>
        {filteredIssues.length === 0 ? (
          <p>No issues in this category</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(issue => (
                <tr key={issue._id}>
                  <td>{issue.description}</td>
                  <td>{issue.category || "N/A"}</td>
                  <td>{issue.status}</td>
                  <td>
                    {workers.find(w => w._id === issue.workerId)?.name || "Unassigned"}
                  </td>
                  <td>
                    {issue.imagePath && (
                      <img 
                        src={`/${issue.imagePath}`} 
                        alt="issue" 
                        width={50}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Workers Table */}
      <div className="admin-section">
        <h2>Workers Overview</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Assigned Issues</th>
              <th>Completed</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(worker => {
              const stats = getWorkerStats(worker._id);
              return (
                <tr key={worker._id}>
                  <td>{worker.name}</td>
                  <td>{worker.category}</td>
                  <td>{stats.assigned}</td>
                  <td>{stats.completed}</td>
                  <td>{stats.pending}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
