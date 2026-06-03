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

/* ── SVG icons (no emojis) ─────────────────────────────────── */
const IconGps = () => (
  <svg className="ds-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
    <path d="M5.64 5.64l1.77 1.77M16.6 16.6l1.77 1.77M5.64 18.36l1.77-1.77M16.6 7.4l1.77-1.77" />
  </svg>
);

const IconCellular = () => (
  <svg className="ds-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1.5 8.5C5.3 4.7 10.4 2.5 12 2.5s6.7 2.2 10.5 6" />
    <path d="M5 12c1.8-1.8 4.2-3 7-3s5.2 1.2 7 3" />
    <path d="M8.5 15.5c.9-.9 2.1-1.5 3.5-1.5s2.6.6 3.5 1.5" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconSignal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M1 6C5 2 10.5 0 12 0s7 2 11 6" />
    <path d="M5 10c1.9-2 4.2-3 7-3s5.1 1 7 3" />
    <path d="M9 14c.8-.8 1.8-1.5 3-1.5s2.2.7 3 1.5" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/* ── Helpers ───────────────────────────────────────────────── */
function fmtTime(raw?: string) {
  if (!raw || raw.length < 6) return "—";
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}:${raw.slice(4, 6)} UTC`;
}

function fmtDate(raw?: string) {
  if (!raw || raw.length < 6) return "—";
  return `${raw.slice(0, 2)}/${raw.slice(2, 4)}/20${raw.slice(4, 6)}`;
}

const ICON: Record<string, JSX.Element> = {
  "GPS 1":    <IconGps />,
  Cellular:   <IconCellular />,
};

/* ── Component ─────────────────────────────────────────────── */
const DeviceStatus = () => {
  const [devices, setDevices]   = useState<DeviceCard[]>([]);
  const [gpsRaw, setGpsRaw]     = useState<GpsRaw | null>(null);

  /* Fetch device ping statuses once */
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch("/api/devices");
        const data: { name: string; ip: string }[] = await res.json();
        const withStatus = await Promise.all(
          data.map(async (d) => {
            const route = d.name.toLowerCase().replace(/\s+/g, "");
            try {
              const sr = await fetch(`/api/${route}-status`);
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
    load();
  }, []);

  /* Poll GPS raw data every 5 s */
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/gps-serial");
        setGpsRaw(res.ok ? await res.json() : { error: "GPS collector no disponible" });
      } catch {
        setGpsRaw({ error: "Sin conexión al backend" });
      }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  const statusMeta = (s: string) => {
    if (s === "online")  return { label: "En línea",   cls: "badge-online"  };
    if (s === "offline") return { label: "Sin señal",  cls: "badge-offline" };
    return                      { label: "Desconocido",cls: "badge-unknown" };
  };

  const gpsMeta = () => {
    if (!gpsRaw || gpsRaw.error) return { label: "Sin datos",    cls: "badge-unknown"   };
    if (gpsRaw.valid)             return { label: "Fix activo",   cls: "badge-online"    };
    return                               { label: "Buscando…",    cls: "badge-searching" };
  };

  const isGps = (name: string) => name.startsWith("GPS");

  return (
    <div className="ds-wrap">

      {/* ── Device cards ──────────────────────────────────── */}
      <div className="ds-grid">
        {devices.map((d) => {
          const { label, cls } = statusMeta(d.status);
          return (
            <article key={d.name} className="ds-card" aria-label={d.name}>
              <div className="ds-card-head">
                <span className="ds-icon-wrap">{ICON[d.name] ?? <IconGps />}</span>
                <span className="ds-device-name">{d.name}</span>
                <span className={`ds-badge ${cls}`}>{label}</span>
              </div>

              <dl className="ds-card-body">
                <div className="ds-row">
                  <dt>IP</dt>
                  <dd className="mono">{d.ip || "N/A"}</dd>
                </div>

                {isGps(d.name) && gpsRaw && !gpsRaw.error && (
                  <>
                    <div className="ds-row">
                      <dt>Señal</dt>
                      <dd><span className={`ds-badge ds-badge-sm ${gpsMeta().cls}`}>{gpsMeta().label}</span></dd>
                    </div>
                    <div className="ds-row">
                      <dt>Hora GPS</dt>
                      <dd className="mono">{fmtTime(gpsRaw.time)}</dd>
                    </div>
                    <div className="ds-row">
                      <dt>Fecha GPS</dt>
                      <dd className="mono">{fmtDate(gpsRaw.date)}</dd>
                    </div>
                    <div className="ds-row">
                      <dt>Satélites</dt>
                      <dd className="mono">
                        <span className="sat-count">{gpsRaw.sats_visible ?? "—"}</span>
                        <span className="sat-sep"> visibles / </span>
                        <span className="sat-count">{gpsRaw.sats_used ?? "—"}</span>
                        <span className="sat-sep"> usados</span>
                      </dd>
                    </div>
                  </>
                )}

                {!isGps(d.name) && (
                  <div className="ds-row">
                    <dt>Modo</dt>
                    <dd className="mono">Bypass activo</dd>
                  </div>
                )}
              </dl>
            </article>
          );
        })}
      </div>

      {/* ── GPS live panel ──────────────────────────────────── */}
      <section className="ds-nmea" aria-label="GPS en vivo">
        <div className="ds-nmea-head">
          <span className="ds-nmea-title">
            <IconSignal />
            GPS en vivo — COM3
          </span>
          {gpsRaw?.updated && (
            <time className="ds-nmea-ts" dateTime={gpsRaw.updated}>
              {new Date(gpsRaw.updated).toLocaleTimeString()}
            </time>
          )}
        </div>

        {gpsRaw?.error ? (
          <p className="ds-nmea-error">{gpsRaw.error}</p>
        ) : gpsRaw ? (
          <div className="ds-nmea-grid">
            <div className="ds-nmea-item">
              <span className="ds-nmea-label">Fix</span>
              <span className={`ds-nmea-value ${gpsRaw.fix ? "val-ok" : "val-warn"}`}>
                {gpsRaw.fix ? "Activo" : "Sin fix"}
              </span>
            </div>
            <div className="ds-nmea-item">
              <span className="ds-nmea-label">Satélites</span>
              <span className="ds-nmea-value">
                {gpsRaw.sats_visible ?? "—"} vis / {gpsRaw.sats_used ?? "—"} usados
              </span>
            </div>
            <div className="ds-nmea-item">
              <span className="ds-nmea-label">Hora UTC</span>
              <span className="ds-nmea-value">{fmtTime(gpsRaw.time)}</span>
            </div>
            <div className="ds-nmea-item">
              <span className="ds-nmea-label">Válido</span>
              <span className={`ds-nmea-value ${gpsRaw.valid ? "val-ok" : "val-warn"}`}>
                {gpsRaw.valid ? "Sí" : "No — buscando señal"}
              </span>
            </div>
          </div>
        ) : (
          <p className="ds-nmea-waiting">Esperando datos del puerto serial…</p>
        )}
      </section>
    </div>
  );
};

export default DeviceStatus;
