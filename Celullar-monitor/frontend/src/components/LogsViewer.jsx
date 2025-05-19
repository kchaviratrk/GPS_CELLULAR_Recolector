import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { blue } from "@mui/material/colors";

export default function LogsViewer() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    const fetchLogs = () => {
      fetch("http://localhost:8000/logs")
        .then((res) => res.json())
        .then(setLogs);
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!logs)
    return (
      <Card sx={{ minWidth: 250, marginBottom: 2 }}>
        <CardContent>
          <CircularProgress />
          <Typography>Loading logs...</Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ minWidth: 250, marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h6">Logs</Typography>
        <List dense>
          {logs.map((log, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>
                <EventNoteIcon sx={{ color: blue[700] }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  log.timestamp ? `[${log.timestamp}] ${log.event}` : log.event
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
