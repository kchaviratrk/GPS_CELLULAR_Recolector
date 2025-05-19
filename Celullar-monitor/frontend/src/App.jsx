import Header from "./components/Header";
import ModemStatus from "./components/ModemStatus";
import AlertsTable from "./components/AlertsTable";
import LogsViewer from "./components/LogsViewer";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useState } from "react";
import SignalChart from "./components/SignalChart";
import SettingsPanel from "./components/SettingsPanel";
import { SnackbarProvider } from "notistack";

export default function App() {
  const [settings, setSettings] = useState({ threshold: -90, interval: 5 });
  return (
    <SnackbarProvider maxSnack={3}>
      <Box
        sx={{
          minHeight: "100vh",
          minWidth: "100vw",
          background: "#f7f9fb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container
          disableGutters
          sx={{
            width: { xs: "100%", xl: 3840 },
            height: { xs: "auto", xl: 2160 },
            maxWidth: "100%",
            background: "#fff",
            borderRadius: 2,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            overflow: "auto",
          }}
        >
          <Header />
          <Box sx={{ width: "100%", p: 3 }}>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
                width: "100%",
                mb: 3,
              }}
            >
              <ModemStatus />
              <AlertsTable />
            </Box>
            <Box sx={{ width: "100%", mb: 3 }}>
              <SignalChart settings={settings} />
            </Box>
            <Box sx={{ width: "100%", mb: 3 }}>
              <SettingsPanel settings={settings} onChange={setSettings} />
            </Box>
            <Box sx={{ width: "100%" }}>
              <LogsViewer />
            </Box>
          </Box>
        </Container>
      </Box>
    </SnackbarProvider>
  );
}
