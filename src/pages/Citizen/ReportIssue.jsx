import { useState } from "react";
import "../Citizen/Citizen.css";

export default function ReportIssue() {
  const [photo, setPhoto] = useState(null);

  return (
    <div className="page-wrap">
      <h2>Report an Issue</h2>

      <div className="card form-card">
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />

        <input className="input" type="text" placeholder="Location / Landmark" />

        <select className="input">
          <option>Pothole</option>
          <option>Garbage Overflow</option>
          <option>Drainage Block</option>
          <option>Streetlight Not Working</option>
          <option>Streetdogs issues</option>
        </select>

        <textarea className="input" placeholder="Describe the issue"></textarea>

        <button className="btn">Submit Issue</button>
      </div>
    </div>
  );
}
