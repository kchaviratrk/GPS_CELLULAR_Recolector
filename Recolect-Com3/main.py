import tkinter as tk
from tkinter import filedialog
import serial
import threading
from flask import Flask, jsonify
import re

# In-memory data store for GPS readings
gps_data_store = {}

flask_app = Flask(__name__)

class SerialReaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Serial Port Reader")
        self.gps_info = {
            'model': None,
            'firmware': None,
            'antenna': None
        }
        # Serial port configuration
        self.serial_port = None
        self.is_reading = False
        self.data_buffer = []

        # GUI components
        self.text_area = tk.Text(root, height=20, width=50)
        self.text_area.pack()

        self.start_button = tk.Button(root, text="Start", command=self.start_reading)
        self.start_button.pack()

        self.stop_button = tk.Button(root, text="Stop", command=self.stop_reading, state=tk.DISABLED)
        self.stop_button.pack()

        self.export_button = tk.Button(root, text="Export", command=self.export_data)
        self.export_button.pack()

    def start_reading(self):
        try:
            self.serial_port = serial.Serial('COM3', baudrate=9600, timeout=1)
            self.is_reading = True
            self.start_button.config(state=tk.DISABLED)
            self.stop_button.config(state=tk.NORMAL)
            threading.Thread(target=self.read_serial_data, daemon=True).start()
        except serial.SerialException as e:
            self.text_area.insert(tk.END, f"Error: {e}\n")

    def stop_reading(self):
        self.is_reading = False
        if self.serial_port:
            self.serial_port.close()
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)

    def read_serial_data(self):
        while self.is_reading:
            try:
                if self.serial_port.in_waiting > 0:
                    line = self.serial_port.readline().decode('utf-8').strip()
                    self.data_buffer.append(line)
                    self.text_area.insert(tk.END, line + "\n")
                    self.text_area.see(tk.END)

                    # Parse and update GPS data for the device
                    parsed_data = self.parse_gps_data(line)
                    if parsed_data:
                        self.update_gps_data(parsed_data['deviceId'], parsed_data)

                        # Evaluate GPS status and store the last known "alarm status"
                        gps_status = self.evaluate_gps_status(parsed_data)
                        gps_data_store[parsed_data['deviceId']]['alarm_status'] = gps_status
            except serial.SerialException as e:
                self.text_area.insert(tk.END, f"Error: {e}\n")
                break

    def export_data(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text files", "*.txt"), ("CSV files", "*.csv")])
        if file_path:
            with open(file_path, 'w') as file:
                file.write("\n".join(self.data_buffer))

    def parse_gps_data(self, data):
        # Procesamiento robusto de sentencias NMEA y almacenamiento de info extra
        try:
            if data.startswith('$GNGGA'):
                parts = data.split(',')
                if len(parts) >= 15:
                    lat = self.nmea_to_decimal(parts[2], parts[3])
                    lon = self.nmea_to_decimal(parts[4], parts[5])
                    fix = int(parts[6])
                    satellites = int(parts[7])
                    hdop = float(parts[8])
                    altitude = float(parts[9])
                    return {
                        'deviceId': '$GNGGA',
                        'time': parts[1],
                        'lat': lat,
                        'lon': lon,
                        'fix': fix,
                        'satelliteCount': satellites,
                        'hdop': hdop,
                        'altitude': altitude
                    }
            elif data.startswith('$GNGSA'):
                parts = data.split(',')
                if len(parts) >= 17:
                    fix = int(parts[2]) if parts[2].isdigit() else 0
                    pdop = float(parts[15]) if parts[15] else 0.0
                    hdop = float(parts[16]) if parts[16] else 0.0
                    vdop = float(parts[17].split('*')[0]) if '*' in parts[17] else float(parts[17]) if parts[17] else 0.0
                    return {
                        'deviceId': '$GNGSA',
                        'time': '',
                        'lat': 0.0,
                        'lon': 0.0,
                        'fix': fix,
                        'satelliteCount': 0,
                        'hdop': hdop,
                        'altitude': 0.0,
                        'pdop': pdop,
                        'vdop': vdop
                    }
            elif data.startswith('$GPGSV'):
                parts = data.split(',')
                if len(parts) >= 4:
                    satellites = int(parts[3]) if parts[3].isdigit() else 0
                    return {
                        'deviceId': '$GPGSV',
                        'time': '',
                        'lat': 0.0,
                        'lon': 0.0,
                        'fix': 0,
                        'satelliteCount': satellites,
                        'hdop': 0.0,
                        'altitude': 0.0
                    }
            elif data.startswith('$GNRMC'):
                parts = data.split(',')
                if len(parts) >= 12:
                    speed = float(parts[7]) if parts[7] else 0.0
                    return {
                        'deviceId': '$GNRMC',
                        'time': parts[1],
                        'lat': self.nmea_to_decimal(parts[3], parts[4]),
                        'lon': self.nmea_to_decimal(parts[5], parts[6]),
                        'fix': 1 if parts[2] == 'A' else 0,
                        'satelliteCount': 0,
                        'hdop': 0.0,
                        'altitude': 0.0,
                        'speed': speed
                    }
            elif data.startswith('$GNTXT'):
                # Modelo, firmware, antena
                if 'MOD=' in data:
                    self.gps_info['model'] = data.split('MOD=')[1].split('*')[0]
                if 'FWVER=' in data:
                    self.gps_info['firmware'] = data.split('FWVER=')[1].split('*')[0]
                if 'ANTSTATUS=' in data:
                    self.gps_info['antenna'] = data.split('ANTSTATUS=')[1].split('*')[0]
        except Exception:
            return None
        return None

    def nmea_to_decimal(self, value, direction):
        # Convierte coordenadas NMEA a decimal
        try:
            if not value or not direction:
                return 0.0
            deg_len = 2 if direction in ['N', 'S'] else 3
            degrees = float(value[:deg_len])
            minutes = float(value[deg_len:])
            decimal = degrees + minutes / 60
            if direction in ['S', 'W']:
                decimal = -decimal
            return decimal
        except Exception:
            return 0.0

    def update_gps_data(self, device_id, parsed_data):
        # Update the in-memory store with the latest GPS data for the given device
        gps_data_store[device_id] = {
            'timestamp': parsed_data['time'],
            'lat': parsed_data['lat'],
            'lon': parsed_data['lon'],
            'fix': parsed_data['fix'],
            'satellites': parsed_data['satelliteCount'],
            'hdop': parsed_data['hdop'],
            'altitude': parsed_data['altitude']
        }

    def get_gps_data(self, device_id):
        # Return the latest GPS data for the given device or null if not found
        return gps_data_store.get(device_id, None)

    def evaluate_gps_status(self, gps_data):
        fix = gps_data.get('fix', 0)
        satellites = gps_data.get('satelliteCount', 0)
        hdop = gps_data.get('hdop', 0.0)
        timestamp = gps_data.get('time', '')
        speed = gps_data.get('speed', 0.0)
        # Estado antena
        antenna = self.gps_info.get('antenna')
        if antenna and antenna != 'OK':
            return {
                'status': 'critical',
                'message': f'Problema con la antena: {antenna}',
                'timestamp': timestamp
            }
        # Estados de señal y precisión
        if fix < 1 or satellites == 0:
            return {
                'status': 'critical',
                'message': 'Sin señal GPS o sin fix.',
                'timestamp': timestamp
            }
        elif satellites < 4:
            return {
                'status': 'warning',
                'message': f'Pocos satélites ({satellites}). Precisión baja.',
                'timestamp': timestamp
            }
        elif hdop > 5:
            return {
                'status': 'critical',
                'message': f'HDOP muy alto ({hdop}). Precisión muy baja.',
                'timestamp': timestamp
            }
        elif hdop > 2.5:
            return {
                'status': 'warning',
                'message': f'HDOP alto ({hdop}). Precisión degradada.',
                'timestamp': timestamp
            }
        # Estado de movimiento
        if speed > 0.5:
            mov = f'En movimiento ({speed} nudos)'
        else:
            mov = 'Detenido'
        return {
            'status': 'ok',
            'message': f'GPS funcionando correctamente. {mov}',
            'timestamp': timestamp
        }

    @staticmethod
    @flask_app.route('/api/gps-status', methods=['GET'])
    def api_gps_status():
        statuses = [
            {
                'device': device_id,
                'lat': data['lat'],
                'lon': data['lon'],
                'fix': data['fix'],
                'status': data['alarm_status']['status'] if 'alarm_status' in data else "unknown",
                'message': data['alarm_status']['message'] if 'alarm_status' in data else "No status available",
                'timestamp': data['timestamp']
            }
            for device_id, data in gps_data_store.items()
        ]
        return jsonify(statuses)

    @staticmethod
    @flask_app.route('/api/gps-info', methods=['GET'])
    def api_gps_info():
        # Devuelve modelo, firmware y estado de antena
        app = SerialReaderApp
        return jsonify({
            'model': getattr(app, 'gps_info', {}).get('model', None),
            'firmware': getattr(app, 'gps_info', {}).get('firmware', None),
            'antenna': getattr(app, 'gps_info', {}).get('antenna', None)
        })

    @staticmethod
    @flask_app.route('/api/logs', methods=['GET'])
    def api_logs():
        app = SerialReaderApp
        # Devuelve las últimas 100 líneas del buffer de logs
        logs = getattr(app, 'data_buffer', [])[-100:]
        return jsonify({'logs': logs})

def run_flask():
    flask_app.run(port=3000, debug=True, use_reloader=False)

if __name__ == "__main__":
    threading.Thread(target=run_flask, daemon=True).start()
    root = tk.Tk()
    app = SerialReaderApp(root)
    root.mainloop()