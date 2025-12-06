import "./Worker.css";

export default function WorkerDashboard() {
  // Sample stats
  const stats = {
    assigned: 20,
    pending: 6,
    points: 150,
    badges: 3,
  };

  // Data for the donut chart
  const data = [
    { label: "Potholes", value: 40, color: "#ff6b6b" },
    { label: "Garbage", value: 25, color: "#ffa500" },
    { label: "Streetlights", value: 15, color: "#1e90ff" },
    { label: "Drainage", value: 10, color: "#32cd32" },
  ];

  const total = data.reduce((acc, item) => acc + item.value, 0);

  // Function to calculate stroke-dasharray for each slice
  const getStrokeDasharray = (value) => {
    return `${(value / total) * 100} ${100 - (value / total) * 100}`;
  };

  let cumulative = 0;

  return (
    <div className="worker-container">
      <h2 className="wd-title">Worker Dashboard</h2>

      {/* Stats Cards */}
      <div className="wd-stats-cards">
        <div className="wd-card">
          <h3>Assigned Works</h3>
          <p>{stats.assigned}</p>
        </div>
        <div className="wd-card">
          <h3>Pending Works</h3>
          <p>{stats.pending}</p>
        </div>
        <div className="wd-card">
          <h3>Points Earned</h3>
          <p>{stats.points}</p>
        </div>
        <div className="wd-card">
          <h3>Badges</h3>
          <p>{stats.badges}</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="wd-dashboard-wrapper">
        <div className="donut-chart">
          <svg width="180" height="180" viewBox="0 0 36 36">
            {data.map((item, index) => {
              const dashArray = getStrokeDasharray(item.value);
              const path = (
                <path
                  key={index}
                  className="circle"
                  stroke={item.color}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={dashArray}
                  strokeDashoffset={25 - cumulative}
                  d="M18 2
                     a 16 16 0 0 1 0 32
                     a 16 16 0 0 1 0 -32"
                />
              );
              cumulative += (item.value / total) * 100;
              return path;
            })}
          </svg>

          <div className="donut-center">{total}%</div>
        </div>

        <div className="chart-legend">
          {data.map((item, index) => (
            <p key={index}>
              <span className="dot" style={{ backgroundColor: item.color }}></span>
              {item.label} — {item.value}%
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}