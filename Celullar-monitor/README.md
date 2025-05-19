# cellular-monitor

Monitors the status of a cellular modem, retrieves signal quality, and sends alerts (e.g., to Slack) if issues are detected.

## Installation

1. Clone this repository and enter the directory.
2. Install the dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your secrets and required configuration.

## Usage

```bash
python src/main.py
```

## Execution

### Simulation mode (default or using environment variable/argument)

```bash
# Using environment variable
export SIMULATE=True
python src/main.py

# Or using command line argument
python src/main.py --simulate
```

### Real mode (Raspberry Pi hardware)

Make sure the modem is connected and you know the serial port (e.g., /dev/ttyUSB0). You can set it like this:

```bash
export MODEM_PORT=/dev/ttyUSB0
export SIMULATE=False
python src/main.py
```

## Testing and Coverage

To run all unit tests:

```bash
python3 -m pytest tests/
```

To see code coverage:

```bash
python3 -m pytest --cov=src tests/
```

### Latest coverage report (May 19, 2025)

```
Name              Stmts   Miss  Cover
-------------------------------------
src/__init__.py       0      0   100%
src/alerts.py         2      0   100%
src/config.py         2      0   100%
src/main.py          20      4    80%
src/modem.py         12      0   100%
src/utils.py          4      0   100%
-------------------------------------
TOTAL                40      4    90%
```

#### How to interpret the coverage report?

- **Stmts**: Number of executable lines in the file.
- **Miss**: Lines not covered by tests.
- **Cover**: Coverage percentage for that file.
- Aim for 100% in logic modules (modem, alerts, utils, config).
- main.py usually has lower coverage as it is the entry point, but with the integration test it is now covered at 80%.
- If coverage drops, check which lines are not covered and consider adding tests.

## Simulation/Real mode

You can configure simulation mode using the `SIMULATE` environment variable or the `--simulate` argument:

```bash
export SIMULATE=True  # or False
python3 src/main.py
# or
python3 src/main.py --simulate
```

## Best Practices

- All public methods have docstrings.
- Type errors in utils.py are handled.
- Unused imports have been removed.
- Simulation/real mode is configurable via environment variable or .env.

## Pre-merge checklist

- [ ] All tests pass in both simulated and real mode.
- [ ] No unnecessary imports.
- [ ] All public functions have docstrings.
- [ ] Error handling is robust.
- [ ] Environment variables and configuration are documented.
- [ ] Code follows PEP8.
- [ ] No hardware dependencies in default tests.
- [ ] README is up to date.
