import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SimCardIcon from "@mui/icons-material/SimCard";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import Tooltip from "@mui/material/Tooltip";
import { green, red, orange } from "@mui/material/colors";

export default function ModemStatus() {
  const [status, setStatus] = useState(null);

  // Permite alternar entre demo y producción usando una variable de entorno
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000/status";

  useEffect(() => {
    const fetchStatus = () => {
      fetch(API_URL)
        .then((res) => res.json())
        .then(setStatus);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [API_URL]);

  if (!status)
    return (
      <Card sx={{ minWidth: 250, marginBottom: 2 }}>
        <CardContent>
          <CircularProgress />
          <Typography>Loading modem status...</Typography>
        </CardContent>
      </Card>
    );

  const signalColor =
    status.signal_strength > -80
      ? green[600]
      : status.signal_strength > -100
      ? orange[700]
      : red[700];

  return (
    <Card sx={{ minWidth: 250, marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Modem Status
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Tooltip
            title={status.modem_connected ? "Connected" : "Disconnected"}
          >
            {status.modem_connected ? (
              <LinkIcon sx={{ color: green[600] }} />
            ) : (
              <LinkOffIcon sx={{ color: red[700] }} />
            )}
          </Tooltip>
          <Typography>
            {status.modem_connected ? "Connected" : "Disconnected"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Tooltip title="Signal Strength">
            <SignalCellularAltIcon sx={{ color: signalColor }} />
          </Tooltip>
          <Typography sx={{ color: signalColor }}>
            {status.signal_strength} dBm
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={status.sim_present ? "SIM Present" : "No SIM"}>
            <SimCardIcon
              sx={{ color: status.sim_present ? green[600] : red[700] }}
            />
          </Tooltip>
          <Typography>
            {status.sim_present ? "SIM Present" : "No SIM"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
