import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Pin, Search, Folder, Check, Edit2 } from 'lucide-react';

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  onRenameSession
}) {
  const [searchFilter, setSearchFilter] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const workspaces = ['All', 'Growth Strategy', 'Product Ops', 'Interview Prep'];

  // Filter sessions by search & workspace
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesWorkspace = activeWorkspace === 'All' || (s.workspace || 'General') === activeWorkspace;
    return matchesSearch && matchesWorkspace;
  });

  const pinnedSessions = filteredSessions.filter(s => s.is_pinned === 1);
  const unpinnedSessions = filteredSessions.filter(s => s.is_pinned !== 1);

  // Group unpinned sessions by date
  const groupSessionsByDate = (list) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 86400000 * 7;

    const groups = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: []
    };

    list.forEach(s => {
      const sTime = new Date(s.created_at || s.updated_at).getTime();
      if (sTime >= today) {
        groups.Today.push(s);
      } else if (sTime >= yesterday) {
        groups.Yesterday.push(s);
      } else if (sTime >= weekAgo) {
        groups['Previous 7 Days'].push(s);
      } else {
        groups.Older.push(s);
      }
    });

    return groups;
  };

  const grouped = groupSessionsByDate(unpinnedSessions);

  const startRename = (s) => {
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id) => {
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="sidebar">
      {/* Top Action */}
      <div style={{ padding: '16px 14px 12px 14px' }}>
        <button
          className="btn btn-primary"
          onClick={onNewSession}
          style={{ width: '100%', justifyContent: 'center', padding: '10px 12px', fontWeight: '700' }}
        >
          <Plus size={16} />
          <span>New Session</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ padding: '0 14px 10px 14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '6px 10px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <Search size={13} color="var(--text-dim)" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search conversations..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Workspaces Pills */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '0 14px 10px 14px',
        overflowX: 'auto'
      }}>
        {workspaces.map(w => {
          const isActive = activeWorkspace === w;
          return (
            <button
              key={w}
              onClick={() => setActiveWorkspace(w)}
              style={{
                background: isActive ? 'var(--bg-hover)' : 'transparent',
                color: isActive ? 'var(--brand-green-dark)' : 'var(--text-dim)',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-active)' : 'transparent',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {w}
            </button>
          );
        })}
      </div>

      {/* Sessions Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
        {/* Pinned Chats Section */}
        {pinnedSessions.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              fontSize: '10.5px',
              fontWeight: '700',
              color: 'var(--brand-amber)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '6px 8px 4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Pin size={11} /> Pinned Chats ({pinnedSessions.length})
            </div>
            {pinnedSessions.map(sess => renderSessionItem(sess))}
          </div>
        )}

        {/* Date Grouped Sections */}
        {Object.entries(grouped).map(([groupTitle, list]) => {
          if (list.length === 0) return null;
          return (
            <div key={groupTitle} style={{ marginBottom: '14px' }}>
              <div style={{
                fontSize: '10.5px',
                fontWeight: '700',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '6px 8px 4px 8px'
              }}>
                {groupTitle}
              </div>
              {list.map(sess => renderSessionItem(sess))}
            </div>
          );
        })}

        {filteredSessions.length === 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', padding: '16px 8px', textAlign: 'center', fontStyle: 'italic' }}>
            No matching conversations found.
          </div>
        )}
      </div>
    </aside>
  );

  function renderSessionItem(sess) {
    const isActive = sess.id === activeSessionId;
    const isEditing = editingId === sess.id;

    return (
      <div
        key={sess.id}
        onClick={() => onSelectSession(sess.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '8px',
          marginBottom: '3px',
          cursor: 'pointer',
          background: isActive ? 'rgba(19, 138, 77, 0.12)' : 'transparent',
          border: isActive ? '1px solid rgba(19, 138, 77, 0.35)' : '1px solid transparent',
          color: isActive ? 'var(--brand-green-dark)' : 'var(--text-muted)',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
          <MessageSquare size={13} color={isActive ? 'var(--brand-green-dark)' : 'var(--text-dim)'} />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveRename(sess.id)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                flex: 1,
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-active)',
                color: 'var(--text-main)',
                fontSize: '12px',
                borderRadius: '4px',
                padding: '2px 4px'
              }}
            />
          ) : (
            <span style={{ fontSize: '12.5px', fontWeight: isActive ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sess.title}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <button
              onClick={() => saveRename(sess.id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--brand-green-dark)', cursor: 'pointer', padding: '2px' }}
            >
              <Check size={13} />
            </button>
          ) : (
            <>
              <button
                onClick={() => startRename(sess)}
                title="Rename conversation"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => onTogglePinSession && onTogglePinSession(sess.id, sess.is_pinned)}
                title={sess.is_pinned ? "Unpin conversation" : "Pin conversation"}
                style={{ background: 'transparent', border: 'none', color: sess.is_pinned ? 'var(--brand-amber)' : 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
              >
                <Pin size={12} />
              </button>
              <button
                onClick={() => onDeleteSession(sess.id)}
                title="Delete conversation"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}
