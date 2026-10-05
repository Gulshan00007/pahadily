@echo off
title Pahadily Backend Server
echo ========================================================
echo       PAHADILY BACKEND - FASTAPI VIRTUAL ENV
echo ========================================================
echo.

cd /d "%~dp0"

IF NOT EXIST ".venv\Scripts\python.exe" (
    echo [INFO] Virtual environment not found. Creating .venv...
    python -m venv .venv
    echo [INFO] Installing requirements into .venv...
    .venv\Scripts\python.exe -m pip install --upgrade pip
    .venv\Scripts\python.exe -m pip install -r requirements.txt
)

echo [INFO] Starting FastAPI server on http://127.0.0.1:8000...
echo [INFO] API Documentation at: http://127.0.0.1:8000/docs
echo.
.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
