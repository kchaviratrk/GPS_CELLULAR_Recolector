import { useEffect, useState } from "react";
import "./DeviceStatus.css";

interface DeviceCard {
  name: string;
  ip: string;
  status: "online" | "offline" | "unknown";
}

interface GpsRaw {
  time?: string;
  valid?: boolean;
  date?: string;
  sats_visible?: number;
  fix?: number;
  sats_used?: number;
  updated?: string;
  error?: string;
}

function formatUtcTime(raw?: string): string {
  if (!raw || raw.length < 6) return "—";
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}:${raw.slice(4, 6)} UTC`;
}

function formatUtcDate(raw?: string): string {
  if (!raw || raw.length < 6) return "—";
  return `${raw.slice(0, 2)}/${raw.slice(2, 4)}/20${raw.slice(4, 6)}`;
}

const ICON: Record<string, string> = {
  "GPS 1": "🛰️",
  "GPS 2": "🛰️",
  Cellular: "📶",
};

const DeviceStatus = () => {
  const [devices, setDevices] = useState<DeviceCard[]>([]);
  const [gpsRaw, setGpsRaw] = useState<GpsRaw | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("/api/devices");
        const data: { name: string; ip: string }[] = await res.json();

        const withStatus = await Promise.all(
          data.map(async (d) => {
            const routeName = d.name.toLowerCase().replace(/\s+/g, "");
            try {
              const sr = await fetch(`/api/${routeName}-status`);
              const sd = await sr.json();
              return { ...d, status: sd.status ?? "unknown" } as DeviceCard;
            } catch {
              return { ...d, status: "unknown" as const };
            }
          })
        );
        setDevices(withStatus);
      } catch (e) {
        console.error("Error fetching devices:", e);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchGps = async () => {
      try {
        const res = await fetch("/api/gps-serial");
        if (res.ok) setGpsRaw(await res.json());
        else setGpsRaw({ error: "GPS collector no disponible" });
      } catch {
        setGpsRaw({ error: "Sin conexión al backend" });
      }
    };

    fetchGps();
    const id = setInterval(fetchGps, 5000);
    return () => clearInterval(id);
  }, []);

  const statusLabel = (s: string) => {
    if (s === "online")  return { text: "En línea",    cls: "badge-online"  };
    if (s === "offline") return { text: "Sin señal",   cls: "badge-offline" };
    return               { text: "Desconocido",        cls: "badge-unknown" };
  };

  const gpsSignalLabel = () => {
    if (!gpsRaw || gpsRaw.error) return { text: "Sin datos", cls: "badge-unknown" };
    if (gpsRaw.valid)             return { text: "Fix activo",  cls: "badge-online"  };
    return                               { text: "Buscando…",   cls: "badge-searching" };
  };

  return (
    <div className="ds-container">

      {/* ── Device cards ─────────────────────────────────────── */}
      <div className="ds-grid">
        {devices.map((d) => {
          const { text, cls } = statusLabel(d.status);
          const isGps = d.name.startsWith("GPS");
          return (
            <div key={d.name} className="ds-card">
              <div className="ds-card-header">
                <span className="ds-icon">{ICON[d.name] ?? "📡"}</span>
                <span className="ds-name">{d.name}</span>
                <span className={`ds-badge ${cls}`}>{text}</span>
              </div>
              <div className="ds-card-body">
                <div className="ds-row"><span>IP</span><span>{d.ip || "—"}</span></div>
                {isGps && gpsRaw && !gpsRaw.error && (
                  <>
                    <div className="ds-row">
                      <span>Señal</span>
                      <span className={`ds-badge ${gpsSignalLabel().cls}`}>{gpsSignalLabel().text}</span>
                    </div>
                    <div className="ds-row"><span>Hora GPS</span><span>{formatUtcTime(gpsRaw.time)}</span></div>
                    <div className="ds-row"><span>Fecha GPS</span><span>{formatUtcDate(gpsRaw.date)}</span></div>
                    <div className="ds-row"><span>Satélites visibles</span><span>{gpsRaw.sats_visible ?? "—"}</span></div>
                    <div className="ds-row"><span>Satélites usados</span><span>{gpsRaw.sats_used ?? "—"}</span></div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── GPS live panel ───────────────────────────────────── */}
      <div className="ds-nmea-panel">
        <div className="ds-nmea-header">
          <span>🛰️ GPS en vivo — COM3</span>
          {gpsRaw?.updated && (
            <span className="ds-nmea-ts">
              {new Date(gpsRaw.updated).toLocaleTimeString()}
            </span>
          )}
        </div>
        {gpsRaw?.error ? (
          <p className="ds-nmea-error">{gpsRaw.error}</p>
        ) : gpsRaw ? (
          <div className="ds-nmea-body">
            <span>Fix: <b>{gpsRaw.fix ? "Activo ✅" : "Sin fix ⏳"}</b></span>
            <span>Satélites: <b>{gpsRaw.sats_visible ?? "—"} visibles / {gpsRaw.sats_used ?? "—"} usados</b></span>
            <span>UTC: <b>{formatUtcTime(gpsRaw.time)}</b></span>
            <span>Válido: <b>{gpsRaw.valid ? "Sí ✅" : "No (buscando señal)"}</b></span>
          </div>
        ) : (
          <p className="ds-nmea-waiting">Esperando datos del puerto serial…</p>
        )}
      </div>
    </div>
  );
};

export default DeviceStatus;
