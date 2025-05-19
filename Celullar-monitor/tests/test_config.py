import os
import importlib

def test_config_defaults():
    config = importlib.import_module('src.config').CONFIG
    assert config["MODEM_PORT"] == "/dev/ttyUSB0"
    assert config["ALERT_THRESHOLD"] == 10
    assert config["BAUDRATE"] == 115200
    assert config["SIMULATE"] is False


def test_config_env(monkeypatch):
    monkeypatch.setenv("MODEM_PORT", "/dev/test")
    monkeypatch.setenv("ALERT_THRESHOLD", "5")
    monkeypatch.setenv("MODEM_BAUDRATE", "9600")
    monkeypatch.setenv("SIMULATE", "True")
    import importlib
    import sys
    sys.modules.pop('src.config', None)
    config = importlib.import_module('src.config').CONFIG
    assert config["MODEM_PORT"] == "/dev/test"
    assert config["ALERT_THRESHOLD"] == 5
    assert config["BAUDRATE"] == 9600
    assert config["SIMULATE"] is True
