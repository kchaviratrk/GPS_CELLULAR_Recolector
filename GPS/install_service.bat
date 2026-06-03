@echo off
REM ============================================================
REM  GPS Collector — Windows Scheduled Task Installer
REM  Run this script ONCE as Administrator after deployment.
REM  It registers a task that starts the GPS collector at boot,
REM  running as SYSTEM (no user login required).
REM ============================================================
setlocal

set "TASK_NAME=GPSCollector"
set "WRAPPER=%~dp0Recolect-Com3\autostart.bat"

echo Installing scheduled task: %TASK_NAME%
echo Wrapper: %WRAPPER%
echo.

REM Remove any previous version of the task
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

REM Create the task:
REM   /sc ONSTART  — trigger: system boot (before user login)
REM   /ru SYSTEM   — run as the SYSTEM account
REM   /rl HIGHEST  — highest privilege level
REM   /delay 00:30 — wait 30 s after boot so USB-serial adapters enumerate
schtasks /create ^
    /tn "%TASK_NAME%" ^
    /tr "\"%WRAPPER%\"" ^
    /sc ONSTART ^
    /ru SYSTEM ^
    /rl HIGHEST ^
    /delay 00:30 ^
    /f

if %ERRORLEVEL%==0 (
    echo.
    echo [OK] Tarea "%TASK_NAME%" instalada correctamente.
    echo      El GPS collector iniciara automaticamente en el proximo reinicio.
    echo      Para iniciar ahora sin reiniciar, ejecuta:
    echo        schtasks /run /tn "%TASK_NAME%"
) else (
    echo.
    echo [ERROR] No se pudo crear la tarea programada.
    echo         Asegurate de ejecutar este script como Administrador.
)
echo.
pause
