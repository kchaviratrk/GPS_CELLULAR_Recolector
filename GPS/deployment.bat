@echo off
setlocal enabledelayedexpansion

REM Instalar dependencias backend
cd backend
call npm install
cd ..

REM Instalar dependencias frontend
cd frontend
call npm install
REM Construir frontend para producción
call npm run build
cd ..

REM Instalar dependencias Python (si existe requirements.txt)
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
start cmd /k "cd backend && node server.js"

REM Arrancar proceso Python en nueva ventana (si existe main.py)
if exist Recolect-Com3\main.py (
  start cmd /k "cd Recolect-Com3 && if exist venv (call venv\Scripts\activate) && python main.py"
)

echo Despliegue completo. Backend y proceso Python corriendo en nuevas ventanas.
