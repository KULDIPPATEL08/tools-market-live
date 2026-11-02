import asyncio
from backend.app.core.database import SessionLocal
from backend.app.api.startups import list_startups, get_startup_metrics, create_startup, delete_startup, StartupCreate
from backend.app.api.ai_radar import get_ai_models, get_benchmark_matrix
from backend.app.api.search import perform_search, get_search_history, SearchRequest
from backend.app.api.briefings import generate_briefing, list_briefings, BriefingGenerateRequest

def test_startup_radar():
    db = SessionLocal()
    metrics = get_startup_metrics(db)
    assert metrics["total_startups"] >= 5
    assert metrics["india_startups"] >= 2
    assert metrics["gujarat_startups"] >= 2

    startups = list_startups(is_india=True, db=db)
    assert len(startups["items"]) >= 2

    # Create & delete
    created = create_startup(StartupCreate(
        name="Test Radar Labs",
        tagline="AI developer tools for local latency reduction",
        stage="Seed",
        country="India",
        city="Ahmedabad",
        is_india=True,
        is_gujarat=True,
        industry="Developer Tools"
    ), db)
    assert "id" in created

    del_res = delete_startup(created["id"], db)
    assert "message" in del_res
    db.close()

def test_ai_radar():
    db = SessionLocal()
    models = get_ai_models(db=db)
    assert len(models) >= 4
    assert any("Claude" in m["name"] or "DeepSeek" in m["name"] or "Llama" in m["name"] for m in models)

    benchmarks = get_benchmark_matrix(db=db)
    assert len(benchmarks) >= 4
    assert "arena_elo" in benchmarks[0]
    db.close()

def test_universal_search():
    db = SessionLocal()
    search_req = SearchRequest(query="Sarvam", mode="startup", provider="local")
    coro = perform_search(search_req, db)
    try:
        coro.send(None)
        res = None
    except StopIteration as e:
        res = e.value

    assert res is not None
    assert res.total_results >= 1
    assert "Sarvam" in res.results[0].title

    history = get_search_history(db=db)
    assert len(history) >= 1
    db.close()

def test_briefings():
    db = SessionLocal()
    b = generate_briefing(BriefingGenerateRequest(briefing_type="daily"), db)
    assert "executive_summary" in b
    assert len(b["strategic_takeaways"]) > 0

    briefings = list_briefings(db=db)
    assert len(briefings) >= 1
    db.close()

if __name__ == "__main__":
    print("Testing Startup Radar...")
    test_startup_radar()
    print("Testing AI Radar...")
    test_ai_radar()
    print("Testing Universal Search...")
    test_universal_search()
    print("Testing Intelligence Briefings...")
    test_briefings()
    print("ALL MODULE TESTS PASSED PERFECTLY!")
