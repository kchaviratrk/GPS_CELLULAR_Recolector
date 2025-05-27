@echo off
cd Recolect-Com3
if exist venv (call venv\Scripts\activate)
python main.py
