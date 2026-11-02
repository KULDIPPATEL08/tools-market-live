# Scoutboard — Intelligence Discovery & Research Platform

Scoutboard is a unified, production-minded intelligence discovery, research, data collection, and AI-assisted analysis platform. It enables engineers, researchers, founders, and analysts to collect data from legitimate sources, organize evidence, identify market/technical trends, and uncover intelligence gaps.

---

## 🚀 Product Principles

1. **Free-First:** Zero paid API keys required for full functionality out of the box.
2. **Open-Source & Local-First:** Deterministic SHA-256 deduplication, local SQLite or PostgreSQL persistence, and air-gapped execution support.
3. **SSRF-Protected:** Enforces strict RFC1918 private subnet blocking, cloud metadata shielding (`169.254.169.254`), size ceilings (5MB), and request timeouts.
4. **Transparent AI Grounding:** AI research synthesis cites exact primary database records with zero fabricated citations.
5. **Antigravity Spatial Design:** High data density, weightless elevations, subtle glassmorphism (`backdrop-filter: blur(12px)`), dark/light high-contrast palette, and responsive controls.

---

## 🏗️ Architecture

```
e:\aigentools\
  ├── backend\
  │   ├── app\
  │   │   ├── api\          # REST endpoints (auth, sources, collection, records, research, gaps, datasets, tools, analytics, automation, notifications, ai, export)
  │   │   ├── core\         # Security, config, database, SSRF validator
  │   │   ├── models\       # SQLAlchemy models (User, Source, CollectionJob, CollectedRecord, ResearchProject, Gap, etc.)
  │   │   ├── schemas\      # Pydantic request/response schemas
  │   │   ├── services\     # Connectors (RSS, GitHub, Hacker News, Webpage, File Ingestion), Deduplication, Gap Detector, AI
  │   │   ├── main.py       # FastAPI application entrypoint
  │   │   └── init_db.py    # Database initial seed
  │   ├── tests\            # Pytest unit and end-to-end integration test suite
  │   ├── requirements.txt  # Python backend dependencies
  │   └── venv\             # Python virtual environment
  ├── frontend\
  │   ├── src\
  │   │   ├── components\   # UI primitives (Card, Modal, Badge, Button, EmptyState) and Layout (Sidebar, TopNav, GlobalSearchModal)
  │   │   ├── pages\        # 10 core workspace pages (Overview, Discover, Collection, Sources, Research, Tools, Datasets, Analytics, Automation, Saved Items)
  │   │   ├── services\     # Typed API client
  │   │   ├── store\        # Zustand state stores
  │   │   ├── types\        # TypeScript domain models
  │   │   ├── App.tsx       # Router and QueryClient
  │   │   └── index.css     # Antigravity spatial styles and glass tokens
  │   ├── package.json      # React 18, Vite, Tailwind CSS, Lucide, Recharts
  │   └── vite.config.ts    # Dev server and backend proxy
  ├── DESIGN.md             # Complete UI/UX design tokens and principles
  ├── README.md             # This documentation
  └── .env.example          # Environment variables template
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup

```powershell
# Navigate to workspace
cd e:\aigentools

# Activate Python virtual environment
.\backend\venv\Scripts\Activate.ps1

# Run database migration / seeding
python -m backend.app.init_db

# Start FastAPI backend server (Runs on port 8000)
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API documentation (Swagger UI) is immediately accessible at:
👉 **`http://localhost:8000/api/v1/docs`**

### 2. Frontend Setup

```powershell
# Navigate to frontend directory
cd e:\aigentools\frontend

# Start Vite development server
npm run dev
```

Frontend application is immediately accessible at:
👉 **`http://localhost:5173`**

### 3. Run Automated Test Suite

```powershell
$env:PYTHONPATH="e:\aigentools"
.\backend\venv\Scripts\pytest.exe backend\tests -v
```

All 14 unit and end-to-end workflow tests will run:
- SSRF prevention & loopback IP blocking
- JWT login & user authentication
- Primary source connectors & sync jobs
- Deduplication & SHA-256 fingerprint generation
- Research dossier notes & evidence citations
- Dataset explorer query engine
- Local AI evidence synthesizer
- CSV/JSON file ingestion and export

---

## 🛡️ Security Boundaries

- **SSRF Defense:** Prevents requests targeting `127.0.0.1`, `localhost`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`, and `metadata.google.internal`.
- **Payload Limits:** Maximum 5MB per webpage fetch; maximum 10MB per uploaded CSV/JSON file.
- **Passwords:** Hashed using industry-standard `bcrypt` with salt rounds.

---

## 📜 Verified Workflows Included

| Workflow | Description | Status |
|---|---|---|
| **Workflow A** | User login → Add RSS source → Sync → Search discoveries → Save item | ✅ Verified |
| **Workflow B** | Connect GitHub → Search repositories → Star/fork inspection → Bookmark | ✅ Verified |
| **Workflow C** | Create research project → Markdown notes → Evidence citations → Export dossier | ✅ Verified |
| **Workflow D** | Create automation rule → Interval trigger → Gap scan → Notifications | ✅ Verified |
| **Workflow E** | CSV / JSON file ingestion → Schema mapping → Deduplication → CSV export | ✅ Verified |

