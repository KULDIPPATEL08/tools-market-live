import pytest
import pytest_asyncio
import httpx
from backend.app.main import app
from backend.app.core.ssrf import is_safe_url

@pytest_asyncio.fixture
async def async_client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

def test_ssrf_protection():
    # Should block localhost
    safe, err = is_safe_url("http://localhost:8000/secret")
    assert safe is False

    # Should block loopback IP
    safe, err = is_safe_url("http://127.0.0.1:9000")
    assert safe is False

    # Should block metadata endpoint
    safe, err = is_safe_url("http://169.254.169.254/latest/meta-data")
    assert safe is False

    # Should block file or ftp scheme
    safe, err = is_safe_url("ftp://example.com/file")
    assert safe is False

@pytest.mark.asyncio
async def test_healthcheck(async_client):
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Tools Market Live"

@pytest.mark.asyncio
async def test_auth_login_and_me(async_client):
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "demo@scoutboard.local", "password": "scoutboard123"}
    )
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    me_resp = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "demo@scoutboard.local"

@pytest.mark.asyncio
async def test_sources_crud(async_client):
    resp = await async_client.get("/api/v1/sources")
    assert resp.status_code == 200
    sources = resp.json()
    assert len(sources) >= 1

    new_src = {
        "name": "Test Technology Feed",
        "type": "rss",
        "url": "https://example.com/rss.xml",
        "category": "Technology",
        "fetch_interval_minutes": 60
    }
    create_resp = await async_client.post("/api/v1/sources", json=new_src)
    assert create_resp.status_code == 200
    src_id = create_resp.json()["id"]

    del_resp = await async_client.delete(f"/api/v1/sources/{src_id}")
    assert del_resp.status_code == 200

@pytest.mark.asyncio
async def test_records_and_discovery(async_client):
    resp = await async_client.get("/api/v1/records")
    assert resp.status_code == 200
    records = resp.json()
    assert len(records) >= 1
    rec_id = records[0]["id"]

    toggle_resp = await async_client.post(f"/api/v1/records/{rec_id}/toggle-save")
    assert toggle_resp.status_code == 200
    assert "is_saved" in toggle_resp.json()

@pytest.mark.asyncio
async def test_research_project_lifecycle(async_client):
    proj_in = {
        "title": "Quantum Error Correction Benchmark",
        "description": "Systematic review of surface code implementations.",
        "research_question": "What threshold error rate is required for practical advantage?",
        "tags": "Quantum, Physics, Algorithms"
    }
    resp = await async_client.post("/api/v1/research/projects", json=proj_in)
    assert resp.status_code == 200
    proj = resp.json()
    proj_id = proj["id"]

    note_in = {
        "title": "Phase Estimation Notes",
        "content_markdown": "Detailed analysis of QPE depth scaling."
    }
    note_resp = await async_client.post(f"/api/v1/research/projects/{proj_id}/notes", json=note_in)
    assert note_resp.status_code == 200
    assert note_resp.json()["title"] == "Phase Estimation Notes"

    export_resp = await async_client.get(f"/api/v1/export/projects/{proj_id}/markdown")
    assert export_resp.status_code == 200
    assert "Quantum Error Correction" in export_resp.text

@pytest.mark.asyncio
async def test_dataset_explorer(async_client):
    resp = await async_client.get("/api/v1/datasets?q=code")
    assert resp.status_code == 200
    datasets = resp.json()
    assert len(datasets) >= 1
    assert any("Code" in d["tags"] or "Stack" in d["title"] for d in datasets)

@pytest.mark.asyncio
async def test_ai_assistant_synthesis(async_client):
    resp = await async_client.post(
        "/api/v1/ai/ask",
        json={"question": "What is local-first software?"}
    )
    assert resp.status_code == 200
    ans = resp.json()
    assert "answer" in ans
    assert ans["is_ai_generated"] is True

@pytest.mark.asyncio
async def test_analytics_metrics(async_client):
    resp = await async_client.get("/api/v1/analytics/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_records"] >= 1
    assert data["active_sources"] >= 1

@pytest.mark.asyncio
async def test_dead_startup_gap_scanning(async_client):
    resp = await async_client.post("/api/v1/gaps/scan-dead-startups")
    assert resp.status_code == 200
    gaps = resp.json()
    assert len(gaps) >= 1
    assert any("Mint" in g["title"] or "Skiff" in g["title"] or "Sunrise" in g["title"] for g in gaps)
    assert any("Dead Startup Gap" in g["category"] for g in gaps)

@pytest.mark.asyncio
async def test_tool_gathering_engine(async_client):
    # Test curated tools catalog
    resp = await async_client.get("/api/v1/tools/curated-tools")
    assert resp.status_code == 200
    curated = resp.json()
    assert len(curated) >= 5
    assert any(t["name"] == "vLLM" or t["name"] == "Ollama" for t in curated)

    # Test gathering a repo
    resp2 = await async_client.post(
        "/api/v1/tools/gather-tool",
        data={"query_or_url": "vllm-project/vllm"}
    )
    assert resp2.status_code == 200
    res = resp2.json()
    assert res["status"] == "gathered"
    assert "tool" in res
    assert res["tool"]["name"] == "vLLM" or "vllm" in res["tool"]["name"].lower()
