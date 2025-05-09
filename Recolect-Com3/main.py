import tkinter as tk
from tkinter import filedialog
import serial
import threading
from flask import Flask, jsonify

# In-memory data store for GPS readings
gps_data_store = {}

app = Flask(__name__)

class SerialReaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Serial Port Reader")

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
        # Dummy implementation for parsing GPS data
        # Replace with actual parsing logic
        try:
            parts = data.split(',')
            return {
                'deviceId': parts[0],
                'time': parts[1],
                'lat': float(parts[2]),
                'lon': float(parts[3]),
                'fix': int(parts[4]),
                'satelliteCount': int(parts[5]),
                'hdop': float(parts[6]),
                'altitude': float(parts[7])
            }
        except (IndexError, ValueError):
            return None

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

        if fix < 1:
            return {
                'status': 'critical',
                'message': 'No fix',
                'timestamp': timestamp
            }
        elif satellites < 4:
            return {
                'status': 'warning',
                'message': 'Satellite count low',
                'timestamp': timestamp
            }
        elif hdop > 2.5:
            return {
                'status': 'warning',
                'message': 'HDOP too high',
                'timestamp': timestamp
            }
        else:
            return {
                'status': 'ok',
                'message': 'All parameters nominal',
                'timestamp': timestamp
            }

    @app.route('/api/gps-status', methods=['GET'])
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

if __name__ == "__main__":
    root = tk.Tk()
    app = SerialReaderApp(root)
    root.mainloop()
    app.run(port=3000, debug=True)