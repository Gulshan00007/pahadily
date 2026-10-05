# Pahadily Backend Runner for PowerShell
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "========================================================" -ForegroundColor Green
Write-Host "      PAHADILY BACKEND - FASTAPI VIRTUAL ENV" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "[INFO] Creating virtual environment in .venv..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "[INFO] Installing dependencies from requirements.txt..." -ForegroundColor Yellow
    & .venv\Scripts\python.exe -m pip install -r requirements.txt
}

Write-Host "[INFO] Starting FastAPI on http://127.0.0.1:8000..." -ForegroundColor Cyan
Write-Host "[INFO] Swagger Docs at http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""

& .venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
