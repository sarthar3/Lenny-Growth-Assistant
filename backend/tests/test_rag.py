import pytest
from app.services.rag_engine import RAGEngine
from app.services.transcript_loader import parse_timestamp_sec

def test_parse_timestamp_sec():
    assert parse_timestamp_sec("00:01:27") == 87
    assert parse_timestamp_sec("01:13:28") == 4408
    assert parse_timestamp_sec("02:15") == 135

def test_rag_in_memory_indexing():
    rag = RAGEngine()
    sample_dataset = [
        (
            {
                "id": "brian-chesky",
                "guest": "Brian Chesky",
                "title": "Brian Chesky's new playbook",
                "youtube_url": "https://www.youtube.com/watch?v=4ef0juAMqoE",
                "video_id": "4ef0juAMqoE"
            },
            [
                {
                    "transcript_id": "brian-chesky",
                    "speaker": "Brian Chesky",
                    "timestamp": "00:01:00",
                    "timestamp_sec": 60,
                    "content": "Leaders must be in the details of the product rather than micromanaging.",
                    "chunk_index": 0
                }
            ]
        )
    ]
    rag.index_in_memory(sample_dataset)
    assert rag.is_indexed is True
    results = rag.retrieve("details product leadership", top_k=1)
    assert len(results) == 1
    assert results[0]["guest"] == "Brian Chesky"
    assert "t=60s" in results[0]["youtube_url"]
