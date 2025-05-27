#!/bin/bash
cd "$(dirname "$0")/Recolect-Com3"
if [ -d "venv" ]; then
  source venv/bin/activate
fi
python3 main.py
