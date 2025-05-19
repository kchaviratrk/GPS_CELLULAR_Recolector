import React, { useEffect, useState } from "react";
import "./GPSStatusDashboard.css";

const GPSStatusDashboard = () => {
  const [gpsData, setGpsData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [emergentLogs, setEmergentLogs] = useState([]);

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

    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLogs(data.logs || []);
        // Detect emergent logs (e.g., lines containing [EMERG] or [IMPORTANT])
        const now = Date.now();
        const newEmergents = (data.logs || [])
          .filter((line) => /\[(EMERG|IMPORTANT)\]/i.test(line))
          .map((line) => ({ line, timestamp: now }));
        // Only add new emergent logs that are not already present
        setEmergentLogs((prev) => {
          // Remove expired logs
          const filtered = prev.filter((l) => now - l.timestamp < 60000);
          // Add new logs if not already present
          const linesSet = new Set(filtered.map((l) => l.line));
          newEmergents.forEach((l) => {
            if (!linesSet.has(l.line)) filtered.push(l);
          });
          return filtered;
        });
      } catch (err) {
        // Optional: setError(err.message);
      }
    };

    fetchGPSData();
    fetchLogs();
    const interval = setInterval(() => {
      fetchGPSData();
      fetchLogs();
      // Remove expired emergent logs
      setEmergentLogs((prev) =>
        prev.filter((l) => Date.now() - l.timestamp < 60000)
      );
    }, 5000);

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
      {/* Emergent logs panel */}
      {emergentLogs.length > 0 && (
        <div className="emergent-logs-panel">
          <h2>Emergent Logs</h2>
          <ul>
            {emergentLogs.map((log, idx) => (
              <li key={idx}>{log.line}</li>
            ))}
          </ul>
        </div>
      )}
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
      <div className="logs-panel">
        <h2>Logs del Puerto COM3</h2>
        <div className="logs-content">
          {logs.length === 0 ? (
            <div>No hay logs recientes.</div>
          ) : (
            <pre>
              {logs.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPSStatusDashboard;
