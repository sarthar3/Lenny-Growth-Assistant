import React, { useState, useRef, useEffect } from 'react';
import {
  Send, BookOpen, Layers, ArrowRight, Loader2, Sparkles, Paperclip,
  BookMarked, Search, CheckCircle2, FileText, Zap, Compass
} from 'lucide-react';
import MessageItem from './MessageItem';

export default function ChatWindow({
  messages,
  onSendMessage,
  onGenerateShip30,
  onOpenArtifact,
  onOpenCitation,
  onOpenPromptLibrary,
  isLoading,
  activeProvider,
  activeMode,
  setActiveMode
}) {
  const [inputText, setInputText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    let finalPrompt = inputText;
    if (attachedFileName) {
      finalPrompt = `[Context Attached: ${attachedFileName}]\n\n${inputText}`;
    }

    onSendMessage(finalPrompt, activeMode);
    setInputText('');
    setAttachedFileName(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  const handleQuickShip30 = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, 'ship30');
    setInputText('');
  };

  const handleQuickCanvas = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, 'strategy_canvas');
    setInputText('');
  };

  return (
    <div className="chat-area">
      {/* Scrollable Message List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 ? (
          /* Redesigned Welcome Screen */
          <div style={{
            maxWidth: '720px',
            margin: '40px auto 0 auto',
            padding: '0 24px',
            textAlign: 'center'
          }}>
            {/* Project Brand Logo */}
            <div style={{
              width: '90px',
              height: '90px',
              margin: '0 auto 14px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 0 24px rgba(71, 185, 119, 0.45))'
            }}>
              <img
                src="/logo.svg"
                alt="Lenny's Growth Assistant Logo"
                style={{ width: '90px', height: '90px', objectFit: 'contain' }}
              />
            </div>

            {/* Personalized Greeting */}
            <h2 style={{
              fontSize: '27px',
              fontWeight: '800',
              color: 'var(--brand-cream)',
              marginBottom: '8px',
              letterSpacing: '-0.02em'
            }}>
              {getGreeting()}, Product Leader 👋
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Welcome to <strong>The Lenny Growth Assistant</strong>. I am strictly grounded in 300+ transcripts from Lenny's Podcast. Ask tactical growth questions, create <strong>Ship 30 for 30 essays</strong>, or render <strong>HTML Strategy Canvases</strong>.
            </p>

            {/* Featured Capabilities Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '11.5px', color: 'var(--brand-green-light)', background: 'rgba(71, 185, 119, 0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} /> 303 Transcripts Grounded
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--brand-amber)', background: 'rgba(255, 178, 71, 0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border-amber)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <BookOpen size={12} /> Ship 30 Content Skill
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--brand-green-light)', background: 'rgba(71, 185, 119, 0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={12} /> Side-by-Side Artifacts
              </span>
            </div>

            {/* Feature Prompt Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div
                onClick={() => onSendMessage("Explain Brian Chesky's single company roadmap strategy and why leaders must be in the details.", 'ask_lenny')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-green-light)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> Brian Chesky's Single Roadmap
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  Why Airbnb abandoned feature pods and returned to a single company-wide roadmap.
                </div>
              </div>

              <div
                onClick={() => onSendMessage("Product-Led Growth Loops vs Paid Marketing", 'ship30')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-amber)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} /> Ship 30 for 30 Essay
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  Generate an atomic ~1,250-word essay on PLG loops vs paid acquisition.
                </div>
              </div>

              <div
                onClick={() => onSendMessage("Create a complete HTML Growth Strategy Canvas artifact based on Lenny's podcast transcripts.", 'strategy_canvas')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-green-light)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} /> Interactive Strategy Canvas
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  Build a visual HTML/CSS Growth Canvas rendered beside the chat.
                </div>
              </div>

              <div
                onClick={() => onSendMessage("Synthesize how Marty Cagan, Shreyas Doshi, and Brian Chesky view the product management role.", 'deep_research')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-amber)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={14} /> Deep Research: PM Role Evolution
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  Multi-guest synthesis comparing viewpoints across Cagan, Doshi, and Chesky.
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageItem
              key={msg.id || idx}
              message={msg}
              onOpenArtifact={onOpenArtifact}
              onOpenCitation={onOpenCitation}
              onRegenerate={() => {
                const lastUser = [...messages].reverse().find(m => m.role === 'user');
                if (lastUser) onSendMessage(lastUser.content, activeMode);
              }}
            />
          ))
        )}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--brand-green-light)', fontSize: '13.5px' }}>
            <Loader2 size={18} className="animate-spin" />
            <span>Analyzing 55,396 transcript chunks with <strong>{activeProvider}</strong> in <strong>{activeMode.replace('_', ' ')}</strong> mode...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Rich Chat Composer */}
      <div style={{
        padding: '14px 24px 18px 24px',
        background: 'var(--bg-sidebar)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: '880px', margin: '0 auto', position: 'relative' }}>
          {/* Active Attachment Pill if loaded */}
          {attachedFileName && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(71, 185, 119, 0.15)',
              border: '1px solid var(--border-active)',
              color: 'var(--brand-green-light)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              marginBottom: '8px'
            }}>
              <FileText size={12} />
              <span>Attached: {attachedFileName}</span>
              <button
                type="button"
                onClick={() => setAttachedFileName(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '4px' }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-card)',
            transition: 'border-color 0.2s ease',
            gap: '8px'
          }}>
            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask Lenny (${activeMode.replace('_', ' ')} mode)... or type a growth topic`}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />

            {/* Composer Action Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(71, 185, 119, 0.1)' }}>
              {/* Left action tools */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* File Attachment */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach PRD or notes file"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                  }}
                >
                  <Paperclip size={14} />
                  <span>Attach</span>
                </button>

                {/* Prompt Library */}
                <button
                  type="button"
                  onClick={onOpenPromptLibrary}
                  title="Open Prompt Library"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brand-amber)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  <BookMarked size={14} />
                  <span>Prompt Library</span>
                </button>
              </div>

              {/* Right mode quick buttons & submit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleQuickShip30}
                  disabled={isLoading || !inputText.trim()}
                  className="btn btn-ship30"
                  style={{ padding: '6px 12px', fontSize: '11.5px', opacity: !inputText.trim() ? 0.4 : 1 }}
                >
                  <BookOpen size={13} />
                  <span>Ship 30 Essay</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickCanvas}
                  disabled={isLoading || !inputText.trim()}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '11.5px', borderColor: 'var(--border-active)', opacity: !inputText.trim() ? 0.4 : 1 }}
                >
                  <Layers size={13} color="var(--brand-green-light)" />
                  <span>Canvas</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="btn btn-primary"
                  style={{ padding: '7px 14px', opacity: !inputText.trim() ? 0.5 : 1 }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
