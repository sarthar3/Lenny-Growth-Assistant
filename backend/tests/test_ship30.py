import pytest
from app.services.ship30_skill import ship30_skill

@pytest.mark.asyncio
async def test_ship30_essay_generation():
    result = await ship30_skill.generate_essay(
        topic="Brian Chesky's Product Leadership",
        target_guest="Brian Chesky",
        provider_name="mock_local"
    )
    assert "content" in result
    assert "word_count" in result
    assert result["word_count"] > 300
    assert "Conventional Wisdom Trap" in result["content"]
    assert "Execution Blueprint" in result["content"]
