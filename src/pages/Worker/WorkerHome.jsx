import "./Worker.css";

export default function WorkerHome() {
  return (
    <div className="worker-container">
      <h2 className="page-title">Worker Home</h2>

      <div className="worker-home-grid">
        <div className="worker-card">View Issues Assigned</div>
        <div className="worker-card">Issues Resolved</div>
        <div className="worker-card">Pending Tasks</div>
        <div className="worker-card">My Performance</div>
      </div>
    </div>
  );
}
