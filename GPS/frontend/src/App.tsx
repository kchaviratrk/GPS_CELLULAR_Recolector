import React, { Suspense, createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import DeviceStatus from "./DeviceStatus";

export const DeviceContext = createContext({
  devices: [],
  setDevices: () => {},
});

const App = () => {
  const { devices, setDevices } = useContext(DeviceContext);

  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [heartbeatMsg, setHeartbeatMsg] = useState<string | null>(null);

  const sendHeartbeat = async () => {
    setHeartbeatMsg(null);
    try {
      const res = await fetch("/api/heartbeat", { method: "POST" });
      if (res.ok) {
        setHeartbeatMsg("Heartbeat enviado correctamente.");
      } else {
        setHeartbeatMsg("Error al enviar el heartbeat.");
      }
    } catch (err) {
      setHeartbeatMsg("Error de red al enviar el heartbeat.");
    }
  };

  return (
    <DeviceContext.Provider value={{ devices, setDevices }}>
      <div className="App">
        <header
          style={{
            padding: "20px",
            backgroundColor: "var(--primary-color)",
            color: "var(--secondary-color)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="https://trackonomy.ai/wp-content/uploads/2023/06/logo.png"
            alt="Company Logo"
            style={{ height: "50px", marginBottom: "10px" }}
          />
          <h1>{t("welcome")}</h1>
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => changeLanguage("en")}>English</button>
            <button onClick={() => changeLanguage("es")}>Español</button>
          </div>
          <div style={{ marginTop: "20px" }}>
            <button onClick={sendHeartbeat}>Enviar Heartbeat Manual</button>
            {heartbeatMsg && (
              <div style={{ marginTop: "10px", color: "#007b00" }}>
                {heartbeatMsg}
              </div>
            )}
          </div>
        </header>
        <main>
          <Suspense fallback={<div>Loading...</div>}>
            <DeviceStatus />
          </Suspense>
        </main>
      </div>
    </DeviceContext.Provider>
  );
};

export default App;
