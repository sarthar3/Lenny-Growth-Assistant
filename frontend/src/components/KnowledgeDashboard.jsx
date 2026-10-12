import React, { useState, useEffect } from 'react';
import { X, Search, Database, ExternalLink, RefreshCw, CheckCircle2, Radio, Play } from 'lucide-react';
import { fetchEpisodes, fetchHealth } from '../api/client';

export default function KnowledgeDashboard({ isOpen, onClose }) {
  const [episodes, setEpisodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalEpisodes, setTotalEpisodes] = useState(303);
  const [totalChunks, setTotalChunks] = useState(55396);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData('');
    }
  }, [isOpen]);

  const loadData = async (query = '') => {
    setLoading(true);
    try {
      const data = await fetchEpisodes(query, 60);
      setEpisodes(data.episodes || []);
      setTotalEpisodes(data.total || 303);
    } catch (err) {
      console.error('Failed to load episodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    loadData(val);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(38, 30, 23, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-sidebar)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--brand-green-dark), var(--brand-green-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--brand-cream)', margin: 0 }}>
                Podcast Knowledge Base Dashboard
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Real-time index of Lenny's Podcast Transcripts & Grounding Sources
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          padding: '16px 24px',
          background: 'var(--bg-hover)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ background: 'var(--bg-card-solid)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--brand-green-dark)', fontWeight: '600', textTransform: 'uppercase' }}>Indexed Episodes</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--brand-cream)', marginTop: '2px' }}>303 Episodes</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>From official podcast archive</div>
          </div>
          <div style={{ background: 'var(--bg-card-solid)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-amber)' }}>
            <div style={{ fontSize: '11px', color: 'var(--brand-amber)', fontWeight: '600', textTransform: 'uppercase' }}>Knowledge Chunks</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--brand-cream)', marginTop: '2px' }}>55,396 Utterances</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Preserves speaker & timestamp</div>
          </div>
          <div style={{ background: 'var(--bg-card-solid)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--brand-green-dark)', fontWeight: '600', textTransform: 'uppercase' }}>Retrieval Engine</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--brand-cream)', marginTop: '4px' }}>BM25 Okapi + Timestamp</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>&lt; 5ms sub-second latency</div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 24px 8px 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '8px 14px',
            gap: '10px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <Search size={16} color="var(--brand-green-dark)" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search episodes by guest (e.g. Brian Chesky, Shreyas Doshi, Elena Verna)..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {loading && <RefreshCw size={14} className="animate-spin" color="var(--brand-amber)" />}
          </div>
        </div>

        {/* Episode List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px 24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Showing {episodes.length} of {totalEpisodes} Episodes
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {episodes.map((ep, idx) => (
              <div
                key={ep.id || idx}
                style={{
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--brand-cream)' }}>
                      {ep.guest}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--brand-amber)', background: 'rgba(217, 119, 6, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                      {ep.duration || 'Podcast'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.3' }}>
                    {ep.title}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed rgba(19, 138, 77, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {ep.publish_date || 'Full Episode'}
                  </span>
                  {ep.youtube_url && (
                    <a
                      href={ep.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: 'var(--brand-green-dark)',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      <span>Listen / Watch</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
