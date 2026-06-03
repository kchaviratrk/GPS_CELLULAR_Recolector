import { Suspense, createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import DeviceStatus from "./DeviceStatus";

export const DeviceContext = createContext({ devices: [], setDevices: () => {} });

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
  </svg>
);

const App = () => {
  const { devices, setDevices } = useContext(DeviceContext);
  const { t, i18n } = useTranslation();
  const [heartbeatMsg, setHeartbeatMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const sendHeartbeat = async () => {
    setSending(true);
    setHeartbeatMsg(null);
    try {
      const res = await fetch("/api/heartbeat", { method: "POST" });
      setHeartbeatMsg(res.ok ? "Heartbeat enviado" : "Error al enviar");
    } catch {
      setHeartbeatMsg("Error de red");
    } finally {
      setSending(false);
      setTimeout(() => setHeartbeatMsg(null), 4000);
    }
  };

  return (
    <DeviceContext.Provider value={{ devices, setDevices }}>
      <header className="app-header">
        <img
          src="https://trackonomy.ai/wp-content/uploads/2023/06/logo.png"
          alt="Trackonomy"
          className="app-header-logo"
        />
        <div className="app-header-divider" aria-hidden="true" />
        <div className="app-header-title">
          <h1>{t("welcome")}</h1>
          <p>Manufactura de Juárez — Monitor GPS &amp; Cellular</p>
        </div>
        <div className="app-header-controls">
          <button
            className="btn-lang"
            onClick={() => i18n.changeLanguage("en")}
            aria-label="Switch to English"
          >EN</button>
          <button
            className="btn-lang"
            onClick={() => i18n.changeLanguage("es")}
            aria-label="Cambiar a Español"
          >ES</button>
          {heartbeatMsg && (
            <span className="heartbeat-toast" role="status">{heartbeatMsg}</span>
          )}
          <button
            className="btn-heartbeat"
            onClick={sendHeartbeat}
            disabled={sending}
            aria-label="Enviar heartbeat manual"
          >
            <HeartIcon />
            {sending ? "Enviando…" : "Heartbeat"}
          </button>
        </div>
      </header>

      <main>
        <Suspense fallback={null}>
          <DeviceStatus />
        </Suspense>
      </main>
    </DeviceContext.Provider>
  );
};

export default App;
