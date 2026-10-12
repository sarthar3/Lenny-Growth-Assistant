import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ArtifactViewer from './components/ArtifactViewer';
import KnowledgeDashboard from './components/KnowledgeDashboard';
import PromptLibraryModal from './components/PromptLibraryModal';
import CitationModal from './components/CitationModal';

import {
  fetchSessions,
  createSession,
  updateSession,
  fetchSessionDetails,
  deleteSession,
  sendChatMessage,
  generateShip30Essay,
  fetchConfig
} from './api/client';

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [activeProvider, setActiveProvider] = useState('groq');
  const [activeMode, setActiveMode] = useState('ask_lenny');
  const [isLoading, setIsLoading] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [activeCitationModal, setActiveCitationModal] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load initial config and sessions list
  useEffect(() => {
    const init = async () => {
      try {
        const cfg = await fetchConfig();
        setActiveProvider(cfg.active_provider || 'groq');

        const sessList = await fetchSessions();
        setSessions(sessList);
        if (sessList.length > 0) {
          loadSession(sessList[0].id);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    init();
  }, []);

  const loadSession = async (sessionId) => {
    setActiveSessionId(sessionId);
    try {
      const details = await fetchSessionDetails(sessionId);
      setMessages(details.messages || []);

      // Auto-open last artifact if present
      const lastWithArtifact = [...(details.messages || [])].reverse().find(m => m.artifact);
      if (lastWithArtifact) {
        setActiveArtifact(lastWithArtifact.artifact);
      }
    } catch (err) {
      console.error(`Failed to load session ${sessionId}:`, err);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSess = await createSession('New Conversation', activeProvider);
      setSessions(prev => [newSess, ...prev]);
      setActiveSessionId(newSess.id);
      setMessages([]);
      setActiveArtifact(null);
    } catch (err) {
      alert(`Failed to create session: ${err.message}`);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          loadSession(updated[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
          setActiveArtifact(null);
        }
      }
    } catch (err) {
      alert(`Failed to delete session: ${err.message}`);
    }
  };

  const handleTogglePinSession = async (sessionId, currentPinned) => {
    try {
      const nextPin = currentPinned === 1 ? 0 : 1;
      await updateSession(sessionId, { is_pinned: nextPin });
      const updated = await fetchSessions();
      setSessions(updated);
    } catch (err) {
      console.error('Failed to pin/unpin session:', err);
    }
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      await updateSession(sessionId, { title: newTitle });
      const updated = await fetchSessions();
      setSessions(updated);
    } catch (err) {
      console.error('Failed to rename session:', err);
    }
  };

  const handleSendMessage = async (text, mode = activeMode) => {
    setIsLoading(true);
    let currentSessId = activeSessionId;

    try {
      if (!currentSessId) {
        const titleSnippet = text.length > 32 ? text.slice(0, 32) + '...' : text;
        const newSess = await createSession(titleSnippet, activeProvider);
        currentSessId = newSess.id;
        setSessions(prev => [newSess, ...prev]);
        setActiveSessionId(currentSessId);
      }

      // Optimistic user message addition
      const tempUserMsg = {
        id: `user-${Date.now()}`,
        session_id: currentSessId,
        role: 'user',
        content: text,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      const asstMsg = await sendChatMessage(currentSessId, text, activeProvider, mode);
      setMessages(prev => [...prev, asstMsg]);

      if (asstMsg.artifact) {
        setActiveArtifact(asstMsg.artifact);
      }

      // Refresh sessions list safely
      try {
        const sessList = await fetchSessions();
        setSessions(sessList);
      } catch (sessErr) {
        console.warn('Non-blocking: could not refresh sessions list:', sessErr);
      }
    } catch (err) {
      alert(`Chat error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateShip30 = async (topic) => {
    setIsLoading(true);
    let currentSessId = activeSessionId;

    try {
      if (!currentSessId) {
        const newSess = await createSession(`Ship 30: ${topic.slice(0, 25)}`, activeProvider);
        currentSessId = newSess.id;
        setSessions(prev => [newSess, ...prev]);
        setActiveSessionId(currentSessId);
      }

      const tempUserMsg = {
        id: `user-${Date.now()}`,
        session_id: currentSessId,
        role: 'user',
        content: `Generate Ship 30 for 30 Essay: ${topic}`,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      const asstMsg = await generateShip30Essay(currentSessId, topic);
      setMessages(prev => [...prev, asstMsg]);

      if (asstMsg.artifact) {
        setActiveArtifact(asstMsg.artifact);
      }

      // Refresh sessions list safely
      try {
        const sessList = await fetchSessions();
        setSessions(sessList);
      } catch (sessErr) {
        console.warn('Non-blocking: could not refresh sessions list:', sessErr);
      }
    } catch (err) {
      alert(`Ship 30 error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPromptTemplate = (promptObj) => {
    setIsPromptLibraryOpen(false);
    if (!promptObj) return;

    if (promptObj.mode) {
      setActiveMode(promptObj.mode);
    }

    if (promptObj.mode === 'ship30') {
      handleGenerateShip30(promptObj.prompt);
    } else {
      handleSendMessage(promptObj.prompt, promptObj.mode || activeMode);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={loadSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        onRenameSession={handleRenameSession}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Header
          activeProvider={activeProvider}
          setActiveProvider={setActiveProvider}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          onOpenKnowledgeDashboard={() => setIsKnowledgeOpen(true)}
          onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <div className="workspace">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            onGenerateShip30={handleGenerateShip30}
            onOpenArtifact={setActiveArtifact}
            onOpenCitation={(citation) => setActiveCitationModal(citation)}
            onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
            isLoading={isLoading}
            activeProvider={activeProvider}
            activeMode={activeMode}
            setActiveMode={setActiveMode}
          />

          {activeArtifact && (
            <ArtifactViewer
              artifact={activeArtifact}
              onClose={() => setActiveArtifact(null)}
            />
          )}
        </div>
      </div>

      {/* Redesign Modals */}
      <KnowledgeDashboard
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
      />

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={handleSelectPromptTemplate}
      />

      <CitationModal
        citation={activeCitationModal}
        onClose={() => setActiveCitationModal(null)}
      />
    </div>
  );
}
