import tkinter as tk
from tkinter import filedialog
import serial
import threading

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
            except serial.SerialException as e:
                self.text_area.insert(tk.END, f"Error: {e}\n")
                break

    def export_data(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text files", "*.txt"), ("CSV files", "*.csv")])
        if file_path:
            with open(file_path, 'w') as file:
                file.write("\n".join(self.data_buffer))

if __name__ == "__main__":
    root = tk.Tk()
    app = SerialReaderApp(root)
    root.mainloop()