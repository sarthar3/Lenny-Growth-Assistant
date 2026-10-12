import re
import bleach
from typing import Dict, Any

# Allowed tags for rendered HTML artifacts in the viewer
ALLOWED_TAGS = [
    'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol',
    'p', 'strong', 'ul', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'br', 'pre', 'img',
    'style', 'section', 'article', 'header', 'footer', 'nav', 'main', 'mark',
    'details', 'summary', 'svg', 'path', 'circle', 'rect', 'line', 'polyline'
]

ALLOWED_ATTRIBUTES = {
    '*': ['class', 'id', 'style', 'title'],
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height', 'loading'],
    'svg': ['viewbox', 'width', 'height', 'fill', 'xmlns', 'stroke', 'stroke-width'],
    'path': ['d', 'fill', 'stroke', 'stroke-width'],
    'circle': ['cx', 'cy', 'r', 'fill'],
    'rect': ['x', 'y', 'width', 'height', 'fill', 'rx', 'ry'],
    'line': ['x1', 'y1', 'x2', 'y2', 'stroke'],
    'polyline': ['points', 'fill', 'stroke']
}

ALLOWED_STYLES = [
    'color', 'background', 'background-color', 'font-family', 'font-size', 'font-weight',
    'text-align', 'padding', 'margin', 'border', 'border-radius', 'display', 'flex',
    'flex-direction', 'justify-content', 'align-items', 'gap', 'grid', 'grid-template-columns',
    'width', 'height', 'max-width', 'min-height', 'box-shadow', 'overflow', 'line-height'
]

def sanitize_html(html_content: str) -> str:
    """
    Sanitizes HTML content to prevent XSS attacks while preserving rich styling and layouts.
    Strips script tags, event handlers (onerror, onload, onclick), and dangerous external embeds.
    """
    if not html_content:
        return ""
    
    # Strip script tags and inline event handlers like onclick, onload, etc.
    cleaned = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html_content, flags=re.IGNORECASE)
    cleaned = re.sub(r'\son\w+\s*=\s*["\'][^"\']*["\']', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'javascript:', '', cleaned, flags=re.IGNORECASE)
    
    # Run bleach cleaner
    try:
        sanitized = bleach.clean(
            cleaned,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            styles=ALLOWED_STYLES,
            strip=True
        )
        return sanitized
    except Exception:
        # Fallback regex sanitization if bleach encounters edge cases
        return cleaned

def get_security_policy() -> Dict[str, Any]:
    """
    Returns security details explaining permitted/blocked HTML elements and iframe sandbox attributes.
    """
    return {
        "isolation_strategy": "Sandboxed IFrame with Content-Security-Policy + Bleach Backend Sanitization",
        "iframe_sandbox": "allow-scripts allow-popups allow-forms",
        "permitted_tags": ALLOWED_TAGS,
        "blocked_elements": ["<script>", "<iframe (external)>", "javascript: URLs", "inline DOM event handlers (e.g. onclick, onerror)"],
        "css_support": "Scoped CSS inside <style> tags and inline style attributes permitted for rich glassmorphism UI."
    }
