import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def prepare_db():
    await init_db()

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "active_llm_provider" in data

@pytest.mark.asyncio
async def test_session_creation_and_chat_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create Session
        sess_res = await ac.post("/api/sessions", json={"title": "Test PM Chat"})
        assert sess_res.status_code == 201
        session_data = sess_res.json()
        session_id = session_data["id"]

        # Chat message
        chat_res = await ac.post("/api/chat", json={
            "session_id": session_id,
            "content": "What is Brian Chesky's approach to single roadmaps?"
        })
        assert chat_res.status_code == 200
        msg_data = chat_res.json()
        assert msg_data["role"] == "assistant"
        assert len(msg_data["citations"]) > 0

        # Get session details
        get_sess = await ac.get(f"/api/sessions/{session_id}")
        assert get_sess.status_code == 200
        assert len(get_sess.json()["messages"]) >= 2
