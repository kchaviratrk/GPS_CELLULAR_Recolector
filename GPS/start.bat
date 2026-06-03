@echo off
REM ============================================================
REM  GPS Monitoring System — entry point (Windows)
REM  Ejecutar una sola vez para arrancar todo el sistema.
REM ============================================================
cd /d "%~dp0"

REM ── 1. Dependencias Python (UV) ──────────────────────────────
echo Sincronizando dependencias Python con UV...
cd Recolect-Com3
uv sync
cd ..

REM ── 2. GPS Collector: Python headless, COM3 + Flask en :3000 ─
start "GPS-Collector" cmd /k "cd Recolect-Com3 && uv run python main.py --headless"

REM ── 3. Backend Node.js en :5000 ──────────────────────────────
start "GPS-Backend" cmd /k "cd backend && node server.js"

REM ── 4. Frontend React en :5173 ───────────────────────────────
start "GPS-Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo GPS Collector : http://localhost:3000/api/gps-status
echo Backend API   : http://localhost:5000/api/gps-serial
echo Dashboard     : http://localhost:5173
