import { Outlet, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

// Login
import Login from "./pages/Login/Login.jsx";

// Citizen
import CitizenHome from "./pages/Citizen/CitizenHome.jsx";
import CitizenDashboard from "./pages/Citizen/CitizenDashboard.jsx";
import ReportIssue from "./pages/Citizen/ReportIssue.jsx";
import IssueStatus from "./pages/Citizen/IssueStatus.jsx";

// Worker
import WorkerDashboard from "./pages/Worker/WorkerDashboard.jsx";

// Admin
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Citizen */}
        <Route
          path="/citizen/home"
          element={
            <ProtectedRoute role="citizen">
              <CitizenHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute role="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute role="citizen">
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/issues"
          element={
            <ProtectedRoute role="citizen">
              <IssueStatus />
            </ProtectedRoute>
          }
        />

        {/* Worker */}
        <Route
          path="/worker/dashboard"
          element={
            <ProtectedRoute role="worker">
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
