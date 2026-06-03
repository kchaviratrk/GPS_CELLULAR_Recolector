import { useEffect, useState } from "react";

interface Device {
  name: string;
  ip: string;
  status?: string;
}

interface GpsSerial {
  raw: string;
  timestamp: string;
}

const DeviceStatus = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [gpsSerial, setGpsSerial] = useState<GpsSerial | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Fetch device list + ping status once on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("/api/devices");
        const data: Device[] = await response.json();

        const devicesWithStatus = await Promise.all(
          data.map(async (device: Device) => {
            if (device.ip) {
              try {
                const routeName = device.name.toLowerCase().replace(/\s+/g, "");
                const statusResponse = await fetch(`/api/${routeName}-status`);
                const statusData = await statusResponse.json();
                return { ...device, status: statusData.status };
              } catch {
                return { ...device, status: "unknown" };
              }
            } else {
              return { ...device, status: "no ip" };
            }
          })
        );

        setDevices(devicesWithStatus);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices();
  }, []);

  // Poll live GPS serial data every 5 seconds
  useEffect(() => {
    const fetchGps = async () => {
      try {
        const res = await fetch("/api/gps-serial");
        if (res.ok) {
          const data: GpsSerial = await res.json();
          setGpsSerial(data);
          setGpsError(null);
        } else {
          const err = await res.json();
          setGpsError(err.error);
        }
      } catch {
        setGpsError("No se pudo conectar al backend");
      }
    };

    fetchGps();
    const interval = setInterval(fetchGps, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "online":  return "status-online";
      case "offline": return "status-offline";
      case "unknown": return "status-unknown";
      case "no ip":   return "status-no-ip";
      default:        return "status-unknown";
    }
  };

  return (
    <div className="device-status-container">
      {/* ── GPS en vivo ─────────────────────────────────────────────────── */}
      <div className="gps-live-panel">
        <h3>GPS en vivo — COM3</h3>
        {gpsError ? (
          <p className="gps-live-error">{gpsError}</p>
        ) : gpsSerial ? (
          <>
            <p className="gps-live-raw">{gpsSerial.raw}</p>
            <p className="gps-live-ts">Última lectura: {new Date(gpsSerial.timestamp).toLocaleTimeString()}</p>
          </>
        ) : (
          <p className="gps-live-waiting">Esperando datos del puerto serial...</p>
        )}
      </div>

      {/* ── Tabla de dispositivos ────────────────────────────────────────── */}
      <h2>Device Status</h2>
      <table className="device-status-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>IP Address</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device, index) => (
            <tr key={index}>
              <td>{device.name}</td>
              <td>{device.ip || "N/A"}</td>
              <td className={getStatusClass(device.status || "unknown")}>
                {device.status || "unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceStatus;
