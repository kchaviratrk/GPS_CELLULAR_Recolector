"""
Clase para interactuar con un módem mediante comandos AT.
Permite simular respuestas para pruebas.

Ejemplo de uso:
    modem = Modem(simulate=True)
    resp = modem.send_at_command('AT')
    quality = modem.get_signal_quality()
"""

class Modem:
    def __init__(self, port=None, simulate=True):
        """
        Inicializa el módem.
        :param port: Puerto serie del módem (ej: '/dev/ttyUSB0')
        :param simulate: Si es True, simula respuestas del módem.
        """
        self.port = port
        self.simulate = simulate

    def send_at_command(self, command):
        """
        Envía un comando AT al módem y retorna la respuesta.
        :param command: Comando AT a enviar (str)
        :return: Respuesta del módem (str)
        """
        if self.simulate:
            return f"Simulated response for: {command}"
        # TODO: Implementar comunicación real con el módem usando pyserial
        return None

    def get_signal_quality(self):
        """
        Obtiene la calidad de señal (AT+CSQ).
        :return: Nivel de señal (int, 0-31) o None
        """
        if self.simulate:
            return 20  # Valor simulado
        # TODO: Implementar obtención real de señal
        return None
