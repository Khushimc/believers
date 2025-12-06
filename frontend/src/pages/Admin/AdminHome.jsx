import React from "react";
import "./admin.css";

export default function AdminHome() {
  return (
    <div className="admin-container">
      {/* Dashboard Title */}
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Overview Cards */}
      <div className="admin-overview">
        <div className="admin-card">
          <h3>Total Users</h3>
          <p>1,245</p>
        </div>
        <div className="admin-card">
          <h3>Open Issues</h3>
          <p>87</p>
        </div>
        <div className="admin-card">
          <h3>Resolved Issues</h3>
          <p>1,032</p>
        </div>
        <div className="admin-card">
          <h3>Pending Approvals</h3>
          <p>14</p>
        </div>
      </div>

      {/* Example Section with Table */}
      <div className="admin-section">
        <h2>Recent Issues</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#001</td>
              <td>Pothole on 5th Street</td>
              <td className="status-pending">Pending</td>
              <td>Worker A</td>
            </tr>
            <tr>
              <td>#002</td>
              <td>Streetlight not working</td>
              <td className="status-processing">Processing</td>
              <td>Worker B</td>
            </tr>
            <tr>
              <td>#003</td>
              <td>Garbage overflow</td>
              <td className="status-completed">Completed</td>
              <td>Worker C</td>
            </tr>
            <tr>
              <td>#004</td>
              <td>Broken Bench</td>
              <td className="status-cancelled">Cancelled</td>
              <td>Worker D</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}