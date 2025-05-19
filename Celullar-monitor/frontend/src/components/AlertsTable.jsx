import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";
import { yellow, red, blue } from "@mui/material/colors";

function getAlertIcon(level) {
  if (level === "warning")
    return (
      <WarningAmberIcon sx={{ color: yellow[800] }} titleAccess="Warning" />
    );
  if (level === "error")
    return <ErrorIcon sx={{ color: red[700] }} titleAccess="Error" />;
  return <InfoIcon sx={{ color: blue[700] }} titleAccess="Info" />;
}

function getRowStyle(level) {
  if (level === "warning") return { background: "#fffbe6" };
  if (level === "error") return { background: "#ffeaea" };
  return { background: "#eaf4ff" };
}

export default function AlertsTable() {
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    const fetchAlerts = () => {
      fetch("http://localhost:8000/alerts")
        .then((res) => res.json())
        .then(setAlerts);
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!alerts)
    return (
      <Card sx={{ minWidth: 250, marginBottom: 2 }}>
        <CardContent>
          <CircularProgress />
          <Typography>Loading alerts...</Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ minWidth: 250, marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h6">Alerts</Typography>
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table size="small" aria-label="alerts table">
            <TableHead>
              <TableRow>
                <TableCell> </TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert, idx) => (
                <TableRow key={idx} style={getRowStyle(alert.level)}>
                  <TableCell>{getAlertIcon(alert.level)}</TableCell>
                  <TableCell>{alert.timestamp}</TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>{alert.level}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
