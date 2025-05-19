import os
import sys
from src.config import CONFIG
from src.modem import Modem
from src.alerts import send_alert

def main(alert_func=send_alert):
    # Detectar modo simulación por variable de entorno o argumento
    simulate = CONFIG["SIMULATE"]
    if len(sys.argv) > 1 and sys.argv[1] == "--simulate":
        simulate = True
    print(f"[INFO] Modo simulación: {simulate}")
    print(f"[INFO] Puerto del módem: {CONFIG['MODEM_PORT']}")
    modem = Modem(port=CONFIG["MODEM_PORT"], simulate=simulate)
    # Loop principal para monitorear señal y enviar alertas
    try:
        while True:
            signal = modem.get_signal_quality()
            print(f"Signal: {signal}")
            # Ejemplo de uso de la función de alerta
            # alert_func(f"Signal: {signal}")
            break  # Eliminar para loop real
    except KeyboardInterrupt:
        print("\n[INFO] Monitoreo detenido por el usuario.")

if __name__ == "__main__":
    main()
