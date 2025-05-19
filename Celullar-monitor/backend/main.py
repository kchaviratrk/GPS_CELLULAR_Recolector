from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import time

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Estado simulado en memoria
SIMULATED_STATE = {
    "signal_strength": -70,
    "modem_connected": True,
    "sim_present": True,
    "alerts": [],
    "logs": [],
    "last_alert_id": 0,
}

def simulate_signal():
    # Simula fluctuación de señal
    SIMULATED_STATE["signal_strength"] += random.randint(-5, 5)
    SIMULATED_STATE["signal_strength"] = max(-120, min(-50, SIMULATED_STATE["signal_strength"]))

def simulate_alert():
    # Agrega alerta aleatoria si la señal es baja
    if SIMULATED_STATE["signal_strength"] < -90 and random.random() < 0.5:
        SIMULATED_STATE["last_alert_id"] += 1
        alert = {
            "id": SIMULATED_STATE["last_alert_id"],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "message": "Low signal detected",
            "level": "warning"
        }
        SIMULATED_STATE["alerts"].append(alert)

def simulate_log():
    SIMULATED_STATE["logs"].append({
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "event": f"Signal strength: {SIMULATED_STATE['signal_strength']} dBm"
    })
    # Solo conserva los últimos 50 logs
    SIMULATED_STATE["logs"] = SIMULATED_STATE["logs"][-50:]

# --- Integración con módem real ---
USE_REAL_MODEM = True
try:
    from modem_driver import get_modem_status
    USE_REAL_MODEM = True
except ImportError:
    USE_REAL_MODEM = True  # Forzar modo producción aunque falle la importación

@app.get("/status")
def get_status():
    if USE_REAL_MODEM:
        return get_modem_status()
    else:
        simulate_signal()
        simulate_alert()
        simulate_log()
        return {
            "modem_connected": SIMULATED_STATE["modem_connected"],
            "signal_strength": SIMULATED_STATE["signal_strength"],
            "sim_present": SIMULATED_STATE["sim_present"]
        }

@app.get("/alerts")
def get_alerts():
    # Devuelve solo las últimas 10 alertas
    return SIMULATED_STATE["alerts"][-10:]

@app.get("/logs")
def get_logs():
    # Devuelve los últimos 20 logs
    return SIMULATED_STATE["logs"][-20:]
