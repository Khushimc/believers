import "../Citizen/Citizen.css";

export default function CitizenDashboard() {
  return (
    <div className="page-wrap">
      <h2>Citizen Dashboard</h2>

      <div className="card">
        <h3>Your Stats</h3>
        <p>Issues Reported: 4</p>
        <p>Points Earned: 120</p>
        <p>Badges: 2</p>
      </div>
    </div>
  );
}
