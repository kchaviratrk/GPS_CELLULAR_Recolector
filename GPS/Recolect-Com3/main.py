import sys
import serial
import threading
import logging
from flask import Flask, jsonify

SERIAL_PORT = 'COM3'
BAUD_RATE = 9600
FLASK_PORT = 3000

# Retry settings for port open at boot (USB-serial adapters can take a few seconds)
PORT_OPEN_RETRIES = 10
PORT_OPEN_DELAY = 5  # seconds between retries

gps_data_store = {}

flask_app = Flask(__name__)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('gps_collector.log', encoding='utf-8'),
    ]
)
log = logging.getLogger(__name__)


# ── Flask API ─────────────────────────────────────────────────────────────────

@flask_app.route('/api/gps-status', methods=['GET'])
def api_gps_status():
    statuses = [
        {
            'device': device_id,
            'lat': data['lat'],
            'lon': data['lon'],
            'fix': data['fix'],
            'status': data.get('alarm_status', {}).get('status', 'unknown'),
            'message': data.get('alarm_status', {}).get('message', 'No status available'),
            'timestamp': data['timestamp'],
        }
        for device_id, data in gps_data_store.items()
    ]
    return jsonify(statuses)


# ── GPS logic (shared between GUI and headless) ───────────────────────────────

def parse_gps_data(raw):
    try:
        parts = raw.split(',')
        return {
            'deviceId': parts[0],
            'time': parts[1],
            'lat': float(parts[2]),
            'lon': float(parts[3]),
            'fix': int(parts[4]),
            'satelliteCount': int(parts[5]),
            'hdop': float(parts[6]),
            'altitude': float(parts[7]),
        }
    except (IndexError, ValueError):
        return None


def update_gps_data(device_id, parsed):
    gps_data_store[device_id] = {
        'timestamp': parsed['time'],
        'lat': parsed['lat'],
        'lon': parsed['lon'],
        'fix': parsed['fix'],
        'satellites': parsed['satelliteCount'],
        'hdop': parsed['hdop'],
        'altitude': parsed['altitude'],
    }


def evaluate_gps_status(gps_data):
    fix = gps_data.get('fix', 0)
    satellites = gps_data.get('satelliteCount', 0)
    hdop = gps_data.get('hdop', 0.0)
    timestamp = gps_data.get('time', '')

    if fix < 1:
        return {'status': 'critical', 'message': 'No fix', 'timestamp': timestamp}
    if satellites < 4:
        return {'status': 'warning', 'message': 'Satellite count low', 'timestamp': timestamp}
    if hdop > 2.5:
        return {'status': 'warning', 'message': 'HDOP too high', 'timestamp': timestamp}
    return {'status': 'ok', 'message': 'All parameters nominal', 'timestamp': timestamp}


def open_serial_with_retry():
    """Open SERIAL_PORT, retrying on failure to handle boot-time USB enumeration delays."""
    import time
    for attempt in range(1, PORT_OPEN_RETRIES + 1):
        try:
            ser = serial.Serial(SERIAL_PORT, baudrate=BAUD_RATE, timeout=1)
            log.info(f"Opened {SERIAL_PORT} on attempt {attempt}")
            return ser
        except serial.SerialException as e:
            log.warning(f"Attempt {attempt}/{PORT_OPEN_RETRIES}: cannot open {SERIAL_PORT} — {e}")
            if attempt < PORT_OPEN_RETRIES:
                time.sleep(PORT_OPEN_DELAY)
    log.critical(f"Could not open {SERIAL_PORT} after {PORT_OPEN_RETRIES} attempts. Exiting.")
    sys.exit(1)


def read_serial_loop(ser, stop_event, on_line=None):
    """Read serial data until stop_event is set. Calls on_line(text) for each line (GUI hook)."""
    while not stop_event.is_set():
        try:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='replace').strip()
                log.info(f"GPS: {line}")
                if on_line:
                    on_line(line)
                parsed = parse_gps_data(line)
                if parsed:
                    update_gps_data(parsed['deviceId'], parsed)
                    gps_data_store[parsed['deviceId']]['alarm_status'] = evaluate_gps_status(parsed)
        except serial.SerialException as e:
            log.error(f"Serial read error: {e}")
            break


def start_flask_thread():
    t = threading.Thread(
        target=lambda: flask_app.run(port=FLASK_PORT, debug=False, use_reloader=False),
        daemon=True,
    )
    t.start()
    log.info(f"Flask API started on port {FLASK_PORT}")


# ── Headless mode (production / Windows Service / scheduled task) ─────────────

def run_headless():
    log.info("Starting GPS collector in headless mode")
    ser = open_serial_with_retry()
    start_flask_thread()
    stop_event = threading.Event()
    try:
        read_serial_loop(ser, stop_event)
    except KeyboardInterrupt:
        log.info("Interrupted — shutting down")
    finally:
        stop_event.set()
        ser.close()
        log.info("Serial port closed")


# ── GUI mode (development / manual use) ──────────────────────────────────────

def run_gui():
    import tkinter as tk

    class SerialReaderApp:
        def __init__(self, root):
            self.root = root
            self.root.title("GPS Serial Reader")
            self.serial_port_obj = None
            self.stop_event = threading.Event()
            self.data_buffer = []

            self.text_area = tk.Text(root, height=20, width=60)
            self.text_area.pack()

            self.stop_button = tk.Button(root, text="Stop", command=self.stop_reading, state=tk.DISABLED)
            self.stop_button.pack()

            # Auto-start: open COM port as soon as the window is ready
            self.root.after(200, self.start_reading)

        def start_reading(self):
            self.text_area.insert(tk.END, f"Connecting to {SERIAL_PORT}...\n")
            try:
                self.serial_port_obj = serial.Serial(SERIAL_PORT, baudrate=BAUD_RATE, timeout=1)
                self.stop_event.clear()
                self.stop_button.config(state=tk.NORMAL)
                self.text_area.insert(tk.END, f"Connected. Reading data...\n")
                threading.Thread(
                    target=read_serial_loop,
                    args=(self.serial_port_obj, self.stop_event, self._append_line),
                    daemon=True,
                ).start()
            except serial.SerialException as e:
                self.text_area.insert(tk.END, f"Error: {e}\n")

        def _append_line(self, line):
            self.data_buffer.append(line)
            self.text_area.insert(tk.END, line + "\n")
            self.text_area.see(tk.END)

        def stop_reading(self):
            self.stop_event.set()
            if self.serial_port_obj:
                self.serial_port_obj.close()
            self.stop_button.config(state=tk.DISABLED)
            self.text_area.insert(tk.END, "Stopped.\n")

    root = tk.Tk()
    SerialReaderApp(root)
    start_flask_thread()
    root.mainloop()


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if '--headless' in sys.argv:
        run_headless()
    else:
        run_gui()
