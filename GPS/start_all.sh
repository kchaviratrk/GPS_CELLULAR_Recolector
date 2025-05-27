#!/bin/bash

# Arrancar backend
open -a Terminal "$(pwd)/backend_start.sh"

# Arrancar frontend
open -a Terminal "$(pwd)/frontend_start.sh"

# Arrancar main.py de Python
open -a Terminal "$(pwd)/python_start.sh"
