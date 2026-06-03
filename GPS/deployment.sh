#!/bin/bash
set -e

# Instalar dependencias backend
cd "$(dirname "$0")/backend"
echo "Instalando dependencias backend..."
npm install
cd ..

# Instalar dependencias frontend
cd frontend
echo "Instalando dependencias frontend..."
npm install
echo "Construyendo frontend..."
npm run build
cd ..

# Instalar dependencias Python
if [ -d "Recolect-Com3" ]; then
    cd Recolect-Com3
    if [ -f "requirements.txt" ]; then
        echo "Instalando dependencias Python..."
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    fi
    cd ..
fi

# Arrancar backend en background
cd backend
nohup node server.js > ../backend.log 2>&1 &
echo "Backend iniciado (PID $!)"
cd ..

# Arrancar GPS collector en modo headless
if [ -f "Recolect-Com3/main.py" ]; then
    cd Recolect-Com3
    PYTHON="python3"
    if [ -f "venv/bin/python3" ]; then
        PYTHON="venv/bin/python3"
    fi
    nohup "$PYTHON" main.py --headless > ../python.log 2>&1 &
    echo "GPS collector iniciado en headless (PID $!)"
    cd ..
fi

echo ""
echo "Despliegue completo."
echo "  Backend  : http://localhost:5000"
echo "  GPS API  : http://localhost:3000/api/gps-status"
echo "  Log      : python.log / gps_collector.log"
