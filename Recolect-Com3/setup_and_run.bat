@echo off
REM Comprueba si Python está instalado
python --version || (
  echo Python no está instalado. Descárgalo desde https://www.python.org/downloads/
  pause
  exit /b
)

REM Comprueba si Node.js está instalado
node --version || (
  echo Node.js no está instalado. Descárgalo desde https://nodejs.org/
  pause
  exit /b
)

REM Crear entorno virtual de Python
python -m venv venv
call venv\Scripts\activate

REM Instalar dependencias de Python
pip install flask pyserial

REM Instalar dependencias de Node.js para el frontend
cd api
npm install
cd ..

REM Mensaje final
@echo.
@echo Instalación completada.
@echo Para iniciar el backend ejecuta: venv\Scripts\activate && python main.py
@echo Para iniciar el frontend ejecuta: cd api && npm run dev
pause