import os
import re
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
from sqlalchemy import select, func
from app.config import settings
from app.utils.logger import logger
from app.services.transcript_loader import scan_all_transcripts

class RAGEngine:
    _instance = None

    def __init__(self):
        self.chunks_cache: List[Dict[str, Any]] = []
        self.transcripts_cache: Dict[str, Dict[str, Any]] = {}
        self.bm25: Optional[BM25Okapi] = None
        self.is_indexed: bool = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RAGEngine()
        return cls._instance

    def tokenize(self, text: str) -> List[str]:
        """Simple lower-case regex tokenizer for BM25 ranking."""
        return re.findall(r'\w+', text.lower())

    def index_in_memory(self, dataset: List[tuple]):
        """Builds in-memory BM25 index over loaded dataset."""
        all_chunks = []
        trans_dict = {}

        for meta, chunks in dataset:
            trans_dict[meta["id"]] = meta
            for chunk in chunks:
                chunk_copy = dict(chunk)
                chunk_copy["guest"] = meta["guest"]
                chunk_copy["title"] = meta["title"]
                chunk_copy["youtube_url"] = meta["youtube_url"]
                chunk_copy["video_id"] = meta["video_id"]
                all_chunks.append(chunk_copy)

        self.chunks_cache = all_chunks
        self.transcripts_cache = trans_dict

        if self.chunks_cache:
            corpus = [self.tokenize(f"{c['guest']} {c['title']} {c['speaker']} {c['content']}") for c in self.chunks_cache]
            self.bm25 = BM25Okapi(corpus)
            self.is_indexed = True
            logger.info(f"RAGEngine successfully indexed {len(self.chunks_cache)} chunks across {len(self.transcripts_cache)} episodes.")
        else:
            logger.warning("RAGEngine initialized with empty transcript dataset.")

    def ensure_indexed(self, transcript_dir: Optional[str] = None):
        """Loads and indexes transcripts if not already done."""
        if not self.is_indexed or not self.chunks_cache:
            target_dir = transcript_dir or settings.TRANSCRIPT_DIR
            logger.info(f"Indexing transcripts from: {target_dir}")
            dataset = scan_all_transcripts(target_dir)
            self.index_in_memory(dataset)

    def retrieve(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most relevant transcript chunks for a user query.
        Returns detailed list with guest, title, timestamp, youtube link, and text.
        """
        self.ensure_indexed()

        if not self.chunks_cache or not self.bm25:
            return []

        tokenized_query = self.tokenize(query)
        scores = self.bm25.get_scores(tokenized_query)

        # Pair scores with chunk index and sort descending
        scored_indices = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)[:top_k]

        results = []
        for idx, score in scored_indices:
            if score <= 0 and len(results) >= 2:
                break  # Stop if zero relevance once we have a couple matches

            chunk = self.chunks_cache[idx]
            yt_url = chunk.get("youtube_url", "")
            video_id = chunk.get("video_id", "")
            ts_sec = chunk.get("timestamp_sec", 0)

            # Construct exact YouTube timestamped link if video_id exists
            timestamp_url = yt_url
            if video_id and ("youtube.com" in yt_url or "youtu.be" in yt_url):
                timestamp_url = f"https://www.youtube.com/watch?v={video_id}&t={ts_sec}s"

            results.append({
                "chunk_id": chunk.get("chunk_index"),
                "transcript_id": chunk.get("transcript_id"),
                "guest": chunk.get("guest"),
                "episode_title": chunk.get("title"),
                "speaker": chunk.get("speaker"),
                "timestamp": chunk.get("timestamp"),
                "timestamp_sec": ts_sec,
                "youtube_url": timestamp_url,
                "content": chunk.get("content"),
                "relevance_score": float(score)
            })

        return results

rag_engine = RAGEngine.get_instance()
