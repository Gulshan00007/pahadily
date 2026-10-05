#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================"
echo "      PAHADILY BACKEND - FASTAPI VIRTUAL ENV"
echo "========================================================"
echo ""

if [ ! -f ".venv/bin/python" ]; then
    echo "[INFO] Creating virtual environment..."
    python3 -m venv .venv
    echo "[INFO] Installing requirements..."
    .venv/bin/python -m pip install -r requirements.txt
fi

echo "[INFO] Starting FastAPI server on http://127.0.0.1:8000..."
echo "[INFO] Swagger Docs at http://127.0.0.1:8000/docs"
echo ""
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
