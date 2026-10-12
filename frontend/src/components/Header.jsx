import React, { useState, useEffect } from 'react';
import { Database, Zap, Sparkles, BookOpen, Layers, Search, BookMarked, Sun, Moon } from 'lucide-react';
import { fetchConfig, updateConfig, fetchHealth } from '../api/client';

export default function Header({
  activeProvider,
  setActiveProvider,
  activeMode,
  setActiveMode,
  onOpenKnowledgeDashboard,
  onOpenPromptLibrary,
  theme = 'light',
  onToggleTheme
}) {
  const [health, setHealth] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  const loadStatus = async () => {
    try {
      const hData = await fetchHealth();
      setHealth(hData);
    } catch (e) {
      console.error('Health fetch error:', e);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleProviderChange = async (e) => {
    const newProv = e.target.value;
    setIsChanging(true);
    try {
      await updateConfig(newProv);
      setActiveProvider(newProv);
      await loadStatus();
    } catch (err) {
      alert(`Provider switch failed: ${err.message}`);
    } finally {
      setIsChanging(false);
    }
  };

  const modes = [
    { id: 'ask_lenny', label: 'Ask Lenny', icon: Sparkles },
    { id: 'deep_research', label: 'Deep Research', icon: Search },
    { id: 'ship30', label: 'Ship 30 Essay', icon: BookOpen },
    { id: 'strategy_canvas', label: 'Strategy Canvas', icon: Layers }
  ];

  return (
    <header style={{
      height: '66px',
      background: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 30,
      gap: '12px'
    }}>
      {/* Brand Title with Official Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
        <img
          src="/logo.svg"
          alt="Lenny's Growth Assistant"
          style={{ width: '38px', height: '38px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(19, 138, 77, 0.3))' }}
        />
        <div>
          <h1 style={{
            fontSize: '15.5px',
            fontWeight: '700',
            color: 'var(--brand-cream)',
            letterSpacing: '-0.01em',
            margin: 0
          }}>
            Lenny's Growth Assistant
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="status-dot green" /> 303 Transcripts Grounded
          </span>
        </div>
      </div>

      {/* AI Mode Selector (Center) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-hover)',
        borderRadius: '10px',
        padding: '3px',
        border: '1px solid var(--border-color)',
        gap: '3px'
      }}>
        {modes.map(m => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isActive ? 'linear-gradient(135deg, var(--brand-green-dark), var(--brand-green-light))' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
              }}
            >
              <Icon size={13} color={isActive ? '#ffffff' : (m.id === 'ship30' ? 'var(--brand-amber)' : 'var(--brand-green-light)')} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Knowledge Dashboard Trigger */}
        <button
          onClick={onOpenKnowledgeDashboard}
          title="Open Knowledge Base Dashboard"
          style={{
            fontSize: '12px',
            color: 'var(--brand-green-dark)',
            background: 'var(--bg-card-solid)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-active)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <Database size={13} />
          <span>Knowledge Base</span>
        </button>

        {/* Prompt Library Button */}
        <button
          onClick={onOpenPromptLibrary}
          title="Open Prompt Library"
          style={{
            fontSize: '12px',
            color: 'var(--brand-amber)',
            background: 'var(--bg-card-solid)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-amber)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <BookMarked size={13} />
          <span>Prompts</span>
        </button>

        {/* Model Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-card-solid)',
          padding: '5px 10px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <Zap size={13} color="var(--brand-amber)" />
          <select
            value={activeProvider}
            onChange={handleProviderChange}
            disabled={isChanging}
            style={{
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              fontSize: '12px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="groq" style={{ background: 'var(--bg-card-solid)', color: 'var(--text-main)' }}>⚡ Groq (27B)</option>
            <option value="ollama" style={{ background: 'var(--bg-card-solid)', color: 'var(--text-main)' }}>🦙 Ollama (llama3.2)</option>
            <option value="mock_local" style={{ background: 'var(--bg-card-solid)', color: 'var(--text-main)' }}>💾 Offline Fallback</option>
            <option value="anthropic" style={{ background: 'var(--bg-card-solid)', color: 'var(--text-main)' }}>Claude 3.5</option>
            <option value="openai" style={{ background: 'var(--bg-card-solid)', color: 'var(--text-main)' }}>GPT-4o</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {theme === 'light' ? <Moon size={15} color="var(--brand-green-dark)" /> : <Sun size={15} color="var(--brand-amber)" />}
          </button>
        )}
      </div>
    </header>
  );
}
