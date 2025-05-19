import pytest
import sys
from unittest import mock

@pytest.fixture
def mock_modem(monkeypatch):
    class DummyModem:
        def __init__(self, *a, **kw): pass
        def get_signal_quality(self): return 99
    monkeypatch.setattr('src.main.Modem', DummyModem)
    return DummyModem

@mock.patch.dict('os.environ', {"SIMULATE": "True"})
def test_main_simulation(mock_modem):
    import src.main
    called = {}
    def fake_alert(msg):
        called['msg'] = msg
        return True
    src.main.main(alert_func=fake_alert)
    # Puedes agregar asserts sobre 'called' si usas alert_func
