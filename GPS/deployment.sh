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
# Construir frontend para producción
echo "Construyendo frontend..."
npm run build
cd ..

# Instalar dependencias Python (si existe requirements.txt)
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
cd ..

# Arrancar proceso Python en background (si existe main.py)
if [ -f "Recolect-Com3/main.py" ]; then
  cd Recolect-Com3
  if [ -d "venv" ]; then
    source venv/bin/activate
  fi
  nohup python3 main.py > ../python.log 2>&1 &
  cd ..
fi

echo "Despliegue completo. Backend y proceso Python corriendo en background."
