#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo "   Scoutboard Intelligence Platform Deployment    "
echo "=================================================="

# Check Docker availability
if command -v docker &> /dev/null && command -v docker compose &> /dev/null; then
    echo "🐳 Building and starting Scoutboard via Docker Compose..."
    docker compose up --build -d
    echo ""
    echo "✅ Scoutboard is deployed and running!"
    echo "👉 Web Application: http://localhost:8000"
    echo "👉 API Documentation: http://localhost:8000/api/v1/docs"
    exit 0
fi

# Fallback to local process execution
echo "⚙️ Docker not found. Starting local production build..."
cd frontend
npm install --no-audit --no-fund
npm run build
cd ..

python -m pip install -r backend/requirements.txt
python -m backend.app.init_db
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

