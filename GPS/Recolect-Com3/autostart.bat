@echo off
REM Wrapper called by the Windows Scheduled Task.
REM Activates the venv (if present) and launches the GPS collector in headless mode.
cd /d "%~dp0"
if exist venv\Scripts\pythonw.exe (
    venv\Scripts\pythonw.exe main.py --headless
) else (
    pythonw.exe main.py --headless
)
