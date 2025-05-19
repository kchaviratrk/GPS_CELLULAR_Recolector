def format_signal(signal):
    """Formatea la señal como string. Lanza TypeError si la entrada no es numérica."""
    if not isinstance(signal, (int, float)):
        raise TypeError("signal debe ser numérico (int o float)")
    return f"Signal strength: {signal} dBm"
