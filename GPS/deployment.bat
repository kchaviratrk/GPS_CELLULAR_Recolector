@echo off
setlocal enabledelayedexpansion

REM Instalar dependencias backend
cd backend
call npm install
cd ..

REM Instalar dependencias frontend
cd frontend
call npm install
call npm run build
cd ..

REM Instalar dependencias Python
if exist Recolect-Com3 (
    cd Recolect-Com3
    if exist requirements.txt (
        python -m venv venv
        call venv\Scripts\activate
        pip install -r requirements.txt
    )
    cd ..
)

REM Arrancar backend en nueva ventana
start "GPS-Backend" cmd /k "cd backend && node server.js"

REM Arrancar GPS collector en modo headless (sin GUI, sin intervencion manual)
REM pythonw.exe suprime la ventana de consola en Windows
if exist Recolect-Com3\main.py (
    if exist Recolect-Com3\venv\Scripts\pythonw.exe (
        start "" /B Recolect-Com3\venv\Scripts\pythonw.exe Recolect-Com3\main.py --headless
    ) else (
        start "" /B pythonw.exe Recolect-Com3\main.py --headless
    )
    echo GPS collector iniciado en background ^(headless^).
)

echo.
echo Despliegue completo.
echo   Backend  : http://localhost:5000
echo   GPS API  : http://localhost:3000/api/gps-status
echo   Log      : Recolect-Com3\gps_collector.log
