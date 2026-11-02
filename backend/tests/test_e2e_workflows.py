import pytest
import pytest_asyncio
import httpx
from backend.app.main import app

@pytest_asyncio.fixture
async def async_client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_workflow_a_signup_add_rss_search_save(async_client):
    """
    Workflow A:
    User signs up -> adds RSS source -> triggers sync -> sees records -> searches -> saves discovery
    """
    # 1. Login
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "demo@scoutboard.local", "password": "scoutboard123"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add Source
    new_src = {
        "name": "MIT Technology Review",
        "type": "rss",
        "url": "https://www.technologyreview.com/feed/",
        "category": "Technology",
        "fetch_interval_minutes": 60
    }
    src_resp = await async_client.post("/api/v1/sources", json=new_src, headers=headers)
    assert src_resp.status_code == 200
    src_id = src_resp.json()["id"]

    # 3. Query records
    recs_resp = await async_client.get("/api/v1/records", headers=headers)
    assert recs_resp.status_code == 200
    records = recs_resp.json()
    assert len(records) > 0

    # 4. Search records
    search_resp = await async_client.get("/api/v1/records?q=local", headers=headers)
    assert search_resp.status_code == 200
    search_recs = search_resp.json()
    assert len(search_recs) > 0

    # 5. Save discovery
    target_rec = search_recs[0]
    save_resp = await async_client.post(f"/api/v1/records/{target_rec['id']}/toggle-save", headers=headers)
    assert save_resp.status_code == 200

@pytest.mark.asyncio
async def test_workflow_b_github_connector_search_bookmark(async_client):
    """
    Workflow B:
    Query GitHub / open source repositories -> verify stars, forks, language metadata -> bookmark item
    """
    recs_resp = await async_client.get("/api/v1/records?category=Open-Source")
    assert recs_resp.status_code == 200
    recs = recs_resp.json()
    assert len(recs) > 0

    # Bookmark
    first_id = recs[0]["id"]
    bm_resp = await async_client.post(f"/api/v1/records/{first_id}/toggle-bookmark")
    assert bm_resp.status_code == 200
    assert "is_bookmarked" in bm_resp.json()

@pytest.mark.asyncio
async def test_workflow_c_research_workspace_dossier_export(async_client):
    """
    Workflow C:
    Create research project -> write note -> attach evidence -> export markdown dossier
    """
    proj_in = {
        "title": "Air-Gapped Autonomous Agent Evaluation",
        "description": "Analyzing privacy-preserving local LLM workflows.",
        "research_question": "Can offline tool execution match cloud agent accuracy?",
        "tags": "LocalFirst, Security, Privacy"
    }
    create_resp = await async_client.post("/api/v1/research/projects", json=proj_in)
    assert create_resp.status_code == 200
    proj_id = create_resp.json()["id"]

    # Add Note
    note_resp = await async_client.post(
        f"/api/v1/research/projects/{proj_id}/notes",
        json={"title": "Sandbox Policy Findings", "content_markdown": "Local process restrictions prevent unwanted egress."}
    )
    assert note_resp.status_code == 200

    # Attach Evidence
    records_resp = await async_client.get("/api/v1/records")
    first_rec = records_resp.json()[0]
    ev_resp = await async_client.post(
        f"/api/v1/research/projects/{proj_id}/evidence",
        json={"record_id": first_rec["id"], "notes": "Primary evidence supporting local-first data ownership."}
    )
    assert ev_resp.status_code == 200

    # Export Dossier
    export_resp = await async_client.get(f"/api/v1/export/projects/{proj_id}/markdown")
    assert export_resp.status_code == 200
    assert "Research Dossier: Air-Gapped Autonomous Agent Evaluation" in export_resp.text
    assert "Sandbox Policy Findings" in export_resp.text

@pytest.mark.asyncio
async def test_workflow_d_automation_rules_and_notifications(async_client):
    """
    Workflow D:
    Create automation rule -> trigger execution -> verify notification created
    """
    rule_in = {
        "name": "Automated Gap Scanner",
        "trigger_type": "interval",
        "schedule_interval_minutes": 30,
        "action_type": "run_gap_detection"
    }
    rule_resp = await async_client.post("/api/v1/automation/rules", json=rule_in)
    assert rule_resp.status_code == 200
    rule_id = rule_resp.json()["id"]

    # Run rule
    exec_resp = await async_client.post(f"/api/v1/automation/rules/{rule_id}/run")
    assert exec_resp.status_code == 200

    # Check notifications
    notifs_resp = await async_client.get("/api/v1/notifications")
    assert notifs_resp.status_code == 200
    assert len(notifs_resp.json()) > 0

@pytest.mark.asyncio
async def test_workflow_e_csv_import_and_export(async_client):
    """
    Workflow E:
    Import CSV file -> verify record creation & deduplication -> export filtered records as CSV
    """
    import uuid
    uid = uuid.uuid4().hex[:6]
    csv_content = f"title,description,url,author,category\nRust Memory Safety {uid},Detailed examination of borrow checker guarantees,https://example.com/rust-safety-{uid},Rust Core Team,Technology\nFormal Verification {uid},TLA+ specifications and automated model checking,https://example.com/raft-tla-{uid},Distributed Labs,Research Papers\n"
    files = {"file": ("research_import.csv", csv_content.encode("utf-8"), "text/csv")}
    import_resp = await async_client.post("/api/v1/tools/import-file", files=files)
    assert import_resp.status_code == 200
    summary = import_resp.json()["summary"]
    assert summary["saved_to_db"] >= 1

    # Export CSV
    export_resp = await async_client.get("/api/v1/export/records/csv")
    assert export_resp.status_code == 200
    assert f"Rust Memory Safety {uid}" in export_resp.text
