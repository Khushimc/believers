import "../styles/header.css";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // 'citizen' | 'worker' | 'admin' | null

  function handleLogout() {
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    navigate("/login");
  }

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="logo">Smart City</h1>
      </div>

      <nav className="nav-links">
        {/* links visible to everyone (some are public links) */}
        <Link to={role === "citizen" ? "/citizen/home" : "/login"}>Home</Link>

        {role === "citizen" && (
          <>
            <Link to="/citizen/report">Report Issue</Link>
            <Link to="/citizen/dashboard">Dashboard</Link>
            <Link to="/citizen/issues">Issue Status</Link>
          </>
        )}

        {role === "worker" && (
          <>
            <Link to="/worker/home">Worker Home</Link>
            <Link to="/worker/dashboard">Worker Dashboard</Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/admin/home">Admin Home</Link>
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          </>
        )}

        {role ? (
          <button className="header-logout" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="login-link">Login</Link>
        )}
      </nav>
    </header>
  );
}
