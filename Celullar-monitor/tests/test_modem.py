import pytest
from src.modem import Modem

@pytest.fixture
def modem_sim():
    return Modem(simulate=True)

@pytest.fixture
def modem_real():
    return Modem(simulate=False)

def test_send_at_command_simulated(modem_sim):
    resp = modem_sim.send_at_command('AT')
    assert resp == "Simulated response for: AT"

def test_get_signal_quality_simulated(modem_sim):
    assert modem_sim.get_signal_quality() == 20

def test_send_at_command_real(modem_real):
    # En modo real, retorna None (sin implementación)
    assert modem_real.send_at_command('AT') is None

def test_get_signal_quality_real(modem_real):
    assert modem_real.get_signal_quality() is None
