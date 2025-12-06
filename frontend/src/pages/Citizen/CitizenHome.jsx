import "../Citizen/Citizen.css";

export default function CitizenHome() {
  const email = localStorage.getItem("userEmail") || "citizen@test.com";
  return (
    <div className="page-wrap">
      <h2>Welcome, Citizen</h2>
      <p className="muted">Logged in as: {email}</p>

      <div className="grid">
        <div className="card">
          <h3>Report an Issue</h3>
          <p>Quickly report potholes, garbage overflow and more.</p>
          <a className="btn" href="/citizen/report">Report Now</a>
        </div>

        <div className="card">
          <h3>Track Issues</h3>
          <p>See status of issues you've reported.</p>
          <a className="btn" href="/citizen/issues">View Issues</a>
        </div>

        <div className="card">
          <h3>Your Dashboard</h3>
          <p>Points, badges and activity.</p>
          <a className="btn" href="/citizen/dashboard">Open Dashboard</a>
        </div>
      </div>
    </div>
  );
}