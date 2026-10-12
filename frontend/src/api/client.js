const API_BASE = '';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/api/config`);
  if (!res.ok) throw new Error('Failed to load config');
  return res.json();
}

export async function updateConfig(provider, ollamaModel = null) {
  const res = await fetch(`${API_BASE}/api/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, ollama_model: ollamaModel })
  });
  if (!res.ok) throw new Error('Failed to update LLM provider');
  return res.json();
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/api/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function createSession(title = 'New Conversation', model_provider = 'groq', workspace = 'General', is_pinned = 0) {
  const res = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, model_provider, workspace, is_pinned })
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function updateSession(sessionId, updates) {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update session');
  return res.json();
}

export async function fetchSessionDetails(sessionId) {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error(`Failed to fetch session ${sessionId}`);
  return res.json();
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete session ${sessionId}`);
  return true;
}

export async function sendChatMessage(sessionId, content, modelProvider = null, mode = 'ask_lenny') {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      content,
      model_provider: modelProvider,
      mode
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Chat error' }));
    throw new Error(err.detail || 'Failed to send message');
  }
  return res.json();
}

export async function generateShip30Essay(sessionId, topic, targetGuest = null) {
  const res = await fetch(`${API_BASE}/api/chat/ship30`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      topic,
      target_guest: targetGuest
    })
  });
  if (!res.ok) throw new Error('Failed to generate Ship 30 essay');
  return res.json();
}

export async function triggerIngestion() {
  const res = await fetch(`${API_BASE}/api/ingest`, { method: 'POST' });
  if (!res.ok) throw new Error('Ingestion failed');
  return res.json();
}

export async function fetchEpisodes(query = '', limit = 50) {
  const res = await fetch(`${API_BASE}/api/ingest/episodes?query=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch episodes directory');
  return res.json();
}
