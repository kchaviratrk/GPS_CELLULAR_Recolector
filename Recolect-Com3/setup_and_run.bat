@echo off
REM Comprueba si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
  echo Python no está instalado. Abriendo la página de descarga...
  start https://www.python.org/downloads/
  pause
  exit /b
)

REM Comprueba si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
  echo Node.js no está instalado. Abriendo la página de descarga...
  start https://nodejs.org/
  pause
  exit /b
)

REM Crear entorno virtual de Python
python -m venv venv
call venv\Scripts\activate

REM Instalar dependencias de Python
pip install flask pyserial

REM Instalar dependencias de Node.js para el frontend (incluye React)
cd api
npm install
cd ..

REM Mensaje final
@echo.
@echo Instalación completada.
@echo Para iniciar el backend ejecuta: venv\Scripts\activate && python main.py
@echo Para iniciar el frontend ejecuta: cd api && npm run dev
pause