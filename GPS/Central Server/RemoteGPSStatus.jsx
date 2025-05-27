import React, { useState, useEffect } from "react";
import axios from "axios";

const RemoteGPSStatus = () => {
  const [gpsData, setGpsData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/remote-gps");
        setGpsData(response.data);
      } catch (error) {
        console.error("Error fetching GPS data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  const renderCard = (endpoint, data) => {
    let statusColor = "gray";
    const currentTime = Date.now();

    if (data.error) {
      statusColor = "red";
    } else if (data.timestamp) {
      const age = (currentTime - new Date(data.timestamp).getTime()) / 1000;
      if (age > 30) {
        statusColor = "yellow";
      } else {
        statusColor = "green";
      }
    }

    return (
      <div
        key={endpoint}
        style={{
          border: `2px solid ${statusColor}`,
          padding: "10px",
          margin: "10px",
        }}
      >
        <h3>{endpoint}</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div>
      <h1>Remote GPS Status</h1>
      {Object.entries(gpsData).map(([endpoint, data]) =>
        renderCard(endpoint, data)
      )}
    </div>
  );
};

export default RemoteGPSStatus;
