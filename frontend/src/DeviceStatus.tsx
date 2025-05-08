import { useEffect, useState } from "react";

// Define the type for a device
interface Device {
  name: string;
  ip: string;
  status?: string;
}

const DeviceStatus = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("/api/devices");
        const data: Device[] = await response.json();

        // Fetch status for each device
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

  const getStatusClass = (status: string) => {
    switch (status) {
      case "online":
        return "status-online";
      case "offline":
        return "status-offline";
      case "unknown":
        return "status-unknown";
      case "no ip":
        return "status-no-ip";
      default:
        return "status-unknown";
    }
  };

  return (
    <div className="device-status-container">
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
