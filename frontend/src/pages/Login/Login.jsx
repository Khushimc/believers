import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [role, setRole] = useState("citizen");
  const navigate = useNavigate();

  function handleLogin() {
    // Save role
    localStorage.setItem("role", role);

    // Redirect based on role
    if (role === "citizen") navigate("/citizen/home");
    if (role === "worker") navigate("/worker/dashboard");
    if (role === "admin") navigate("/admin/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <h2>Login</h2>

        <select className="login-select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="citizen">Citizen</option>
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>

        <input type="email" className="input" placeholder="demo@example.com" />
        <input type="password" className="input" placeholder="password123" />

        <button className="btn" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
