@echo off
cd /d "%~dp0"
start cmd /k "venv\Scripts\activate && python app.py"
timeout /t 5
start cmd /k "ngrok http 5000"