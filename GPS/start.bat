@echo off
REM ============================================================
REM  GPS Monitoring System — entry point (Windows)
REM  Ejecutar una sola vez para arrancar todo el sistema.
REM ============================================================
cd /d "%~dp0"

REM ── 0. Instalar UV si no está en el sistema ───────────────────
where uv >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo UV no encontrado. Instalando UV...
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    set "PATH=%USERPROFILE%\.local\bin;%APPDATA%\uv\bin;%PATH%"
)
uv --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] UV no disponible. Instalalo manualmente y reinicia el terminal:
    echo   https://docs.astral.sh/uv/getting-started/installation/
    pause
    exit /b 1
)
echo UV listo.

REM ── 1. Dependencias Python (UV) ──────────────────────────────
echo Sincronizando dependencias Python...
cd Recolect-Com3
uv sync
cd ..

REM ── 2. Dependencias Node.js (backend) ────────────────────────
echo Sincronizando dependencias backend...
cd backend
call npm install
cd ..

REM ── 3. Dependencias Node.js (frontend) ───────────────────────
echo Sincronizando dependencias frontend...
cd frontend
call npm install
cd ..

REM ── 4. GPS Collector: Python headless, COM3 + Flask en :3000 ─
start "GPS-Collector" /d "%~dp0Recolect-Com3" cmd /k "uv run python main.py --headless"

REM ── 5. Backend Node.js en :5000 ──────────────────────────────
start "GPS-Backend" /d "%~dp0backend" cmd /k "node server.js"

REM ── 6. Frontend React en :5173 ───────────────────────────────
start "GPS-Frontend" /d "%~dp0frontend" cmd /k "npm run dev"

REM ── 7. Abrir dashboard en el navegador (esperar 5s a que Vite levante) ──
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo GPS Collector : http://localhost:3000/api/gps-status
echo Backend API   : http://localhost:5000/api/gps-serial
echo Dashboard     : http://localhost:5173
