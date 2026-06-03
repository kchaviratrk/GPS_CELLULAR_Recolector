#!/bin/bash
# GPS Monitoring System — arranque diario (dos procesos)
cd "$(dirname "$0")"

node backend/server.js &
BACKEND_PID=$!
echo "Backend iniciado (PID $BACKEND_PID) — http://localhost:5000"

cd frontend
npm run dev
