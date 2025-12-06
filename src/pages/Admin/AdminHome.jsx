import "../Admin/Admin.css";

export default function AdminHome() {
  const email = localStorage.getItem("userEmail") || "admin@test.com";
  return (
    <div className="page-wrap admin">
      <h2>Admin Portal</h2>
      <p className="muted">Logged in as: {email}</p>

      <div className="grid">
        <div className="card">
          <h3>All Issues</h3>
          <p>View, assign, and manage issues.</p>
        </div>

        <div className="card">
          <h3>Workers</h3>
          <p>Manage worker accounts and roles.</p>
        </div>

        <div className="card">
          <h3>Reports & Analytics</h3>
          <p>Overview of system activity.</p>
        </div>
      </div>
    </div>
  );
}
