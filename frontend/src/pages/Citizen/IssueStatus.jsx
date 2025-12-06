import { useState } from "react";
import "../Citizen/Citizen.css";

export default function IssueStatus() {
  // Sample issues
  const issues = [
    { id: 1, title: "Pothole near MG Road", status: "In Progress" },
    { id: 2, title: "Garbage overflow near Hostel", status: "Completed" },
    { id: 3, title: "Street light damage in SIT", status: "In Process" },
  ];

  const handleFixed = (title) => {
    alert(`Response recorded for: ${title}`);
  };

  const handleNotFixed = (title) => {
    alert(`Marked as Not Fixed: ${title}`);
  };

  return (
    <div className="is-page-wrap">
      <h2 className="is-title">Your Reported Issues</h2>

      {issues.map((issue) => (
        <div key={issue.id} className="is-card">
          <div className="is-issue-info">
            <h4 className="is-issue-title">{issue.title}</h4>
            <p className="is-status">Status: {issue.status}</p>
          </div>

          <div className="is-issue-buttons">
            <button
              className="is-btn fixed"
              onClick={() => handleFixed(issue.title)}
            >
              Fixed
            </button>
            <button
              className="is-btn not-fixed"
              onClick={() => handleNotFixed(issue.title)}
            >
              Not Fixed
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}