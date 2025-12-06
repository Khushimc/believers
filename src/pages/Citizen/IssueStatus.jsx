import "../Citizen/Citizen.css";

export default function IssueStatus() {
  return (
    <div className="page-wrap">
      <h2>Your Reported Issues</h2>

      <div className="card">
        <h4>Pothole near MG Road</h4>
        <p>Status: In Progress</p>
      </div>

      <div className="card">
        <h4>Garbage overflow near Hostel</h4>
        <p>Status: Completed</p>
      </div>
      <div className="card">
        <h4> Street light damage in SIT</h4>
        <h4> Status:In process</h4>
      </div>
    </div>
  );
}
