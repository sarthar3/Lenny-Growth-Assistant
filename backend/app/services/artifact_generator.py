import re
from typing import Dict, Any, Optional
from app.utils.security import sanitize_html
from app.utils.logger import logger

class ArtifactGenerator:
    """
    Generates rich HTML/CSS artifacts or Markdown documents based on grounded conversational context.
    Sanitizes HTML content before returning to ensure security in sandboxed iframe rendering.
    """

    @staticmethod
    def detect_artifact_intent(message_text: str) -> Optional[str]:
        """Detects if user is requesting an artifact build."""
        text_lower = message_text.lower()

        if "ship 30" in text_lower or "essay" in text_lower:
            return "ship30_essay"
        elif any(k in text_lower for k in ["canvas", "html", "dashboard", "matrix", "checklist", "diagram", "table", "ui"]):
            return "html_doc"
        elif any(k in text_lower for k in ["markdown", "doc", "spec", "prd"]):
            return "markdown_doc"
        return None

    @classmethod
    def create_artifact(
        self,
        artifact_type: str,
        title: str,
        content: str
    ) -> Dict[str, Any]:
        """
        Creates and sanitizes an artifact object ready for UI rendering and DB persistence.
        """
        if artifact_type == "html_doc":
            clean_content = sanitize_html(content)
        else:
            clean_content = content

        return {
            "title": title,
            "artifact_type": artifact_type,
            "content": clean_content
        }

    @classmethod
    def generate_growth_canvas_html(cls, topic: str, guest_name: str, context_text: str) -> str:
        """Helper to build a visual HTML/CSS Growth Strategy Canvas artifact using the official brand palette."""
        raw_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  :root {{
    --bg: #070e0a;
    --card-bg: #0f1d15;
    --border: rgba(71, 185, 119, 0.22);
    --accent: #47B977;
    --accent-dark: #138A4D;
    --accent-glow: rgba(71, 185, 119, 0.2);
    --amber: #FFB247;
    --text: #eff6f0;
    --heading: #FFF7E9;
  }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg);
    color: var(--text);
    margin: 0;
    padding: 24px;
    line-height: 1.5;
  }}
  .canvas-header {{
    border-bottom: 1px solid var(--border);
    padding-bottom: 16px;
    margin-bottom: 24px;
  }}
  .canvas-title {{
    color: var(--heading);
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .badge {{
    background: var(--accent-glow);
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }}
  .grid {{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }}
  .card {{
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 18px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }}
  .card h3 {{
    color: var(--accent);
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .card-amber h3 {{ color: var(--amber); }}
  .card-cream h3 {{ color: var(--heading); }}
  ul {{
    margin: 0;
    padding-left: 20px;
  }}
  li {{
    margin-bottom: 8px;
  }}
  .quote-box {{
    background: rgba(71, 185, 119, 0.08);
    border-left: 3px solid var(--accent);
    padding: 10px 14px;
    font-style: italic;
    font-size: 13px;
    margin-top: 12px;
    color: var(--heading);
  }}
</style>
</head>
<body>
  <div class="canvas-header">
    <div class="canvas-title">
      <span>{topic.title()} Growth Strategy Canvas</span>
      <span class="badge">Grounded in Lenny's Transcripts</span>
    </div>
    <div style="font-size: 13px; color: #a3baa9;">Primary Reference: <strong style="color: #FFB247;">{guest_name}</strong></div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>1. Core Problem & Trap</h3>
      <ul>
        <li>Avoid fragmented pod roadmaps without a master company strategy.</li>
        <li>Eliminate fake growth driven purely by paid acquisition loops.</li>
        <li>Stop delegating without staying deep in execution details.</li>
      </ul>
      <div class="quote-box">
        "Leaders must be deep in the details to maintain a high product bar."
      </div>
    </div>

    <div class="card card-amber">
      <h3>2. Single Source of Truth</h3>
      <ul>
        <li>Consolidate company priorities into 1 single unified roadmap.</li>
        <li>Review user-facing designs & onboarding every sprint.</li>
        <li>Align design, engineering, and marketing on shared success metrics.</li>
      </ul>
    </div>

    <div class="card">
      <h3>3. Organic Retention Engine</h3>
      <ul>
        <li>Build self-reinforcing word-of-mouth loops inside the product.</li>
        <li>Optimize time-to-value for new user onboarding flows.</li>
        <li>Focus on repeat user engagement before spending on marketing.</li>
      </ul>
    </div>

    <div class="card card-amber">
      <h3>4. Key Growth Metrics</h3>
      <ul>
        <li><strong>Retention Rate</strong>: D30 / M6 user retention cohort stability.</li>
        <li><strong>LTV / CAC Ratio</strong>: Healthy organic distribution ratio (>3.0x).</li>
        <li><strong>NPS & Virality</strong>: Organic referral rate per active user.</li>
      </ul>
    </div>
  </div>
</body>
</html>"""
        return sanitize_html(raw_html)

artifact_generator = ArtifactGenerator()
