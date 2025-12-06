import { useEffect, useState } from "react";
import axios from "axios";
import "../Citizen/Citizen.css"; // keep your existing styles

export default function CitizenStatus() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get("/api/issues");
        setIssues(res.data.filter(issue => issue.userType === "citizen"));
      } catch (err) {
        console.error(err);
      }
    };
    fetchIssues();
  }, []);

  const handleFeedback = async (issueId, isDone) => {
    try {
      await axios.post(`/api/feedback/${issueId}`, { feedback: isDone ? "Done" : "Not Done" });
      alert("Feedback submitted!");
      // refresh issues
      const res = await axios.get("/api/issues");
      setIssues(res.data.filter(issue => issue.userType === "citizen"));
    } catch (err) {
      console.error(err);
      alert("Feedback failed");
    }
  };

  return (
    <div className="page-wrap">
      <h2>Your Reported Issues</h2>

      {issues.length === 0 && <p>No issues submitted yet.</p>}

      {issues.map((issue) => (
        <div key={issue._id} className="card">
          <h4>{issue.description}</h4>
          {issue.imagePath && (
            <img
              src={`http://localhost:5000/${issue.imagePath}`}
              alt=""
              style={{ width: "200px", margin: "10px 0" }}
            />
          )}
          <p>Status: {issue.status}</p>

          {issue.status === "Completed" && !issue.feedback && (
            <div>
              <button onClick={() => handleFeedback(issue._id, true)}>Work Done</button>
              <button onClick={() => handleFeedback(issue._id, false)}>Not Done</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
