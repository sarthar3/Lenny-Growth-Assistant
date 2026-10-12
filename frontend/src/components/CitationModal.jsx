import React from 'react';
import { X, ExternalLink, Play, Quote } from 'lucide-react';

export default function CitationModal({ citation, onClose }) {
  if (!citation) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(38, 30, 23, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-sidebar)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Quote size={16} color="var(--brand-green-dark)" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-cream)' }}>
              Verified Transcript Citation
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--brand-cream)' }}>
              {citation.guest}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--brand-amber)',
              background: 'rgba(217, 119, 6, 0.1)',
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              Timestamp: {citation.timestamp}
            </span>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Episode: <em>{citation.episode_title}</em>
          </div>

          {/* Transcript Snippet Box */}
          <div style={{
            background: 'var(--bg-hover)',
            borderLeft: '4px solid var(--brand-green-dark)',
            padding: '14px 16px',
            borderRadius: '0 8px 8px 0',
            fontSize: '13.5px',
            lineHeight: '1.6',
            color: 'var(--text-main)',
            fontStyle: 'italic',
            marginBottom: '20px'
          }}>
            "{citation.text_snippet}"
          </div>

          {/* Jump to YouTube Link */}
          {citation.youtube_url && (
            <a
              href={citation.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                textDecoration: 'none',
                padding: '10px 16px',
                fontWeight: '600'
              }}
            >
              <Play size={15} />
              <span>Watch on YouTube at Timestamp ({citation.timestamp})</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
