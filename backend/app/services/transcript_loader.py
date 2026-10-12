import os
import re
import yaml
from typing import List, Dict, Any, Tuple
from app.utils.logger import logger

def parse_timestamp_sec(ts_str: str) -> int:
    """Converts (HH:MM:SS) or (MM:SS) to total seconds."""
    ts_str = ts_str.strip("()")
    parts = list(map(int, ts_str.split(":")))
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    elif len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return 0

def load_single_transcript(file_path: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Parses a transcript Markdown file with frontmatter and speaker timestamps.
    Returns metadata dict and list of chunk dicts.
    """
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Separate YAML frontmatter and markdown body
    frontmatter = {}
    body = content
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            try:
                frontmatter = yaml.safe_load(parts[1]) or {}
            except Exception as e:
                logger.warning(f"Error parsing YAML in {file_path}: {e}")
            body = parts[2]

    episode_slug = os.path.basename(os.path.dirname(file_path))
    metadata = {
        "id": episode_slug,
        "guest": frontmatter.get("guest", episode_slug.replace("-", " ").title()),
        "title": frontmatter.get("title", episode_slug.replace("-", " ").title()),
        "publish_date": str(frontmatter.get("publish_date", "")),
        "youtube_url": frontmatter.get("youtube_url", ""),
        "video_id": frontmatter.get("video_id", ""),
        "duration": str(frontmatter.get("duration", "")),
        "description": frontmatter.get("description", ""),
        "keywords": frontmatter.get("keywords", [])
    }

    # Regex to match speaker lines like "Brian Chesky (00:01:27):" or "(00:02:17):"
    speaker_pattern = re.compile(r'^(?P<speaker>[A-Za-z0-9\s\.\,\-\'\"]+)?\s*\((?P<timestamp>\d{2}:\d{2}:\d{2}|\d{2}:\d{2})\):')

    chunks = []
    lines = body.split('\n')

    current_speaker = metadata["guest"]
    current_ts = "00:00:00"
    current_text_buf = []
    chunk_index = 0

    for line in lines:
        line_clean = line.strip()
        if not line_clean or line_clean.startswith('#'):
            continue

        match = speaker_pattern.match(line_clean)
        if match:
            # Flush previous speaker chunk if content exists
            if current_text_buf:
                text_block = " ".join(current_text_buf).strip()
                if len(text_block) > 30:  # Ignore trivial noise
                    ts_sec = parse_timestamp_sec(current_ts)
                    chunks.append({
                        "transcript_id": episode_slug,
                        "speaker": current_speaker,
                        "timestamp": current_ts,
                        "timestamp_sec": ts_sec,
                        "content": text_block,
                        "chunk_index": chunk_index
                    })
                    chunk_index += 1
                current_text_buf = []

            matched_speaker = match.group("speaker")
            if matched_speaker and matched_speaker.strip():
                current_speaker = matched_speaker.strip()
            current_ts = match.group("timestamp")

            # Remainder of line after timestamp
            remainder = line_clean[match.end():].strip()
            if remainder:
                current_text_buf.append(remainder)
        else:
            current_text_buf.append(line_clean)

    # Flush final chunk
    if current_text_buf:
        text_block = " ".join(current_text_buf).strip()
        if len(text_block) > 30:
            ts_sec = parse_timestamp_sec(current_ts)
            chunks.append({
                "transcript_id": episode_slug,
                "speaker": current_speaker,
                "timestamp": current_ts,
                "timestamp_sec": ts_sec,
                "content": text_block,
                "chunk_index": chunk_index
            })

    return metadata, chunks

def scan_all_transcripts(transcripts_dir: str) -> List[Tuple[Dict[str, Any], List[Dict[str, Any]]]]:
    """Scans all episode subdirectories and parses their transcript.md files."""
    results = []
    if not os.path.exists(transcripts_dir):
        logger.warning(f"Transcripts directory {transcripts_dir} does not exist.")
        return results

    for root, dirs, files in os.walk(transcripts_dir):
        for file in files:
            if file.lower() == "transcript.md":
                full_path = os.path.join(root, file)
                try:
                    meta, chunks = load_single_transcript(full_path)
                    results.append((meta, chunks))
                except Exception as e:
                    logger.error(f"Failed to load transcript at {full_path}: {e}")
    logger.info(f"Scanned and loaded {len(results)} transcript episodes.")
    return results
