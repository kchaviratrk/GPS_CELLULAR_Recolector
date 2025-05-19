import os

CONFIG = {
    # Puerto serial del módem (puede ser sobrescrito por variable de entorno MODEM_PORT)
    "MODEM_PORT": os.getenv("MODEM_PORT", "/dev/ttyUSB0"),
    # Umbral de señal para alerta (puede ser sobrescrito por ALERT_THRESHOLD)
    "ALERT_THRESHOLD": int(os.getenv("ALERT_THRESHOLD", 10)),
    # Otros parámetros de hardware
    "BAUDRATE": int(os.getenv("MODEM_BAUDRATE", 115200)),
    # Modo simulación (True/False, por variable SIMULATE)
    "SIMULATE": os.getenv("SIMULATE", "False").lower() == "true",
}
