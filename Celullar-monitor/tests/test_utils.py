from src.utils import format_signal
import pytest

def test_format_signal_success():
    assert format_signal(-70) == "Signal strength: -70 dBm"

def test_format_signal_non_int():
    # Caso de error: entrada no numérica
    with pytest.raises(TypeError):
        format_signal("bad")
