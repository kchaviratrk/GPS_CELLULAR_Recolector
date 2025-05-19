import pytest
from src import alerts

class DummySlack:
    def __init__(self):
        self.called = False
    def send(self, msg):
        self.called = True
        return True

@pytest.fixture
def dummy_slack():
    return DummySlack()

def test_send_alert_monkeypatch(monkeypatch, dummy_slack):
    # Simula integración reemplazando la función real
    monkeypatch.setattr(alerts, 'send_alert', dummy_slack.send)
    result = alerts.send_alert("Test")
    assert dummy_slack.called
    assert result is True

def test_send_alert_default():
    # Por defecto, la función no hace nada y retorna None
    assert alerts.send_alert("Mensaje") is None
