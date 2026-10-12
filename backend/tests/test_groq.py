import pytest
from app.services.llm_factory import GroqProvider

@pytest.mark.asyncio
async def test_groq_provider_chat_response():
    provider = GroqProvider()
    context = [{
        "guest": "Brian Chesky",
        "episode_title": "Brian Chesky's new playbook",
        "timestamp": "00:01:27",
        "youtube_url": "https://www.youtube.com/watch?v=4ef0juAMqoE&t=87s",
        "content": "Leaders must be in the details of the product rather than micromanaging."
    }]
    messages = [{"role": "user", "content": "What does Brian Chesky say about leadership?"}]
    result = await provider.generate_chat_response(messages, context)
    assert "content" in result
    assert len(result["citations"]) > 0
    assert result["citations"][0]["guest"] == "Brian Chesky"
