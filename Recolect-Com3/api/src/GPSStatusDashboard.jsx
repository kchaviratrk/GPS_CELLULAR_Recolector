import React, { useEffect, useState } from "react";
import "./GPSStatusDashboard.css";

const GPSStatusDashboard = () => {
  const [gpsData, setGpsData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGPSData = async () => {
      try {
        const response = await fetch("/api/gps-status");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGpsData(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchGPSData();
    const interval = setInterval(fetchGPSData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div>Loading GPS data...</div>;
  }

  if (error) {
    return <div>Error fetching GPS data: {error}</div>;
  }

  return (
    <div className="gps-dashboard">
      <h1>GPS Status Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Status</th>
            <th>Message</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {gpsData.map((device) => (
            <tr key={device.device}>
              <td>{device.device}</td>
              <td>{device.lat}</td>
              <td>{device.lon}</td>
              <td>
                <span className={`status-badge ${device.status}`}>
                  {device.status}
                </span>
              </td>
              <td>{device.message}</td>
              <td>{device.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GPSStatusDashboard;
