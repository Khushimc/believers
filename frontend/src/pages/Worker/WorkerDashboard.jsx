import "./Worker.css";

export default function WorkerDashboard() {
  return (
    <div className="worker-container">
      <h2 className="page-title">Worker Dashboard</h2>

      <div className="worker-dashboard-wrapper">

        <div className="donut-chart">
          <svg width="180" height="180" viewBox="0 0 36 36">
            <path
              className="circle pothole-stroke"
              strokeDasharray="40, 100"
              d="M18 2
                 a 16 16 0 0 1 0 32
                 a 16 16 0 0 1 0 -32"
            />

            <path
              className="circle garbage-stroke"
              strokeDasharray="25, 100"
              d="M18 2
                 a 16 16 0 0 1 0 32
                 a 16 16 0 0 1 0 -32"
            />

            <path
              className="circle lights-stroke"
              strokeDasharray="11, 100"
              d="M18 2
                 a 16 16 0 0 1 0 32
                 a 16 16 0 0 1 0 -32"
            />
          </svg>

          <div className="donut-center">76%</div>
        </div>

        <div className="chart-legend">
          <p><span className="dot pothole"></span>Potholes — 40%</p>
          <p><span className="dot garbage"></span>Garbage — 25%</p>
          <p><span className="dot lights"></span>Streetlights — 11%</p>
        </div>

      </div>
    </div>
  );
}
