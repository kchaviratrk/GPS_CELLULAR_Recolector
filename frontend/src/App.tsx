import React, { Suspense, createContext, useContext } from "react";
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
