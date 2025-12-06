import { useState, useEffect } from "react";
import "../Citizen/Citizen.css";
import api from "../../api/config";

export default function CitizenDashboard() {
  const [stats, setStats] = useState({
    issuesReported: 0,
    pointsEarned: 0,
    badges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats({
          issuesReported: 4,
          pointsEarned: 120,
          badges: 2,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="cd-page-wrap">
      <h2 className="cd-title">Citizen Dashboard</h2>

      <div className="cd-card">
        <h3 className="cd-card-title">Your Stats</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <p className="cd-stat">Issues Reported: {stats.issuesReported}</p>
            <p className="cd-stat cd-points">Points Earned: {stats.pointsEarned}</p>
            <p className="cd-stat cd-badges">Badges: {stats.badges}</p>
          </>
        )}
      </div>
    </div>
  );
}