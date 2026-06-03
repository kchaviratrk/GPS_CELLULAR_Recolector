@echo off
REM ============================================================
REM  GPS Collector — instalación inicial con UV
REM  Ejecutar solo la primera vez o cuando cambien dependencias.
REM ============================================================

REM Verificar que UV esté instalado
uv --version >nul 2>&1 || (
    echo UV no esta instalado. Instalalo desde https://docs.astral.sh/uv/getting-started/installation/
    pause
    exit /b 1
)

REM Verificar que Node.js esté instalado (para el frontend de api/)
node --version >nul 2>&1 || (
    echo Node.js no esta instalado. Descargalo desde https://nodejs.org/
    pause
    exit /b 1
)

REM Instalar/sincronizar dependencias Python con UV
echo Sincronizando dependencias Python...
uv sync

REM Instalar dependencias del frontend de api/
echo Instalando dependencias del frontend...
cd api
call npm install
cd ..

echo.
echo Instalacion completada.
echo Para iniciar el colector GPS:      uv run python main.py --headless
echo Para abrir la interfaz de debug:   uv run python main.py
pause
