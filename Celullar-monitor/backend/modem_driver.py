# modem_driver.py
# Aquí irá la integración real cuando tengas el hardware.
import serial
import os

def get_modem_status():
    port = os.getenv("MODEM_PORT", "/dev/ttyUSB0")
    baudrate = int(os.getenv("MODEM_BAUDRATE", 115200))
    try:
        with serial.Serial(port, baudrate, timeout=2) as ser:
            # Verificar conexión
            ser.write(b'AT\r')
            resp = ser.read(64)
            modem_connected = b'OK' in resp

            # Obtener señal
            ser.write(b'AT+CSQ\r')
            csq_resp = ser.read(64)
            signal_strength = None
            if b'+CSQ:' in csq_resp:
                try:
                    csq_line = csq_resp.decode(errors='ignore').split('+CSQ:')[1].split('\r')[0]
                    val = csq_line.split(',')[0].strip()
                    signal_strength = int(val) if val.isdigit() else None
                except Exception:
                    signal_strength = None
            # Obtener estado SIM
            ser.write(b'AT+CPIN?\r')
            sim_resp = ser.read(64)
            sim_present = b'READY' in sim_resp
            return {
                "modem_connected": modem_connected,
                "signal_strength": signal_strength if signal_strength is not None else -120,
                "sim_present": sim_present
            }
    except Exception as e:
        # Si hay error, reportar desconectado
        return {
            "modem_connected": False,
            "signal_strength": -120,
            "sim_present": False,
            "error": str(e)
        }
