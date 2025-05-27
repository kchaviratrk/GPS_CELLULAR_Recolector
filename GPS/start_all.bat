@echo off

REM Arrancar backend
start cmd /k backend_start.sh

REM Arrancar frontend
start cmd /k frontend_start.sh

REM Arrancar main.py de Python
start cmd /k python_start.sh
