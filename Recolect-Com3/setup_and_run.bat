@echo off
REM Comprueba si Python está instalado
python --version || (
  echo Python no está instalado. Descárgalo desde https://www.python.org/downloads/
  pause
  exit /b
)

REM Crear entorno virtual
python -m venv venv
call venv\Scripts\activate

REM Instalar pyserial y pyinstaller
pip install pyserial pyinstaller

REM Generar el ejecutable
pyinstaller --onefile main.py

REM Ejecutar la app
dist\main.exe

pause