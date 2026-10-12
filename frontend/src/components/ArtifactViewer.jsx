import React, { useState, useRef, useEffect } from 'react';
import {
  X, Copy, Download, Code, Eye, ShieldCheck, Check,
  Maximize2, Minimize2, Printer, FileText
} from 'lucide-react';

export default function ArtifactViewer({ artifact, onClose }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [copied, setCopied] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [paneWidth, setPaneWidth] = useState(600); // Resizable width in px
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 380 && newWidth < window.innerWidth * 0.85) {
        setPaneWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!artifact) return null;

  const isHtml = artifact.artifact_type === 'html_doc' || artifact.content.trim().startsWith('<!DOCTYPE') || artifact.content.trim().startsWith('<html');

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = isHtml ? 'html' : 'md';
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (isHtml) {
      printWindow.document.write(artifact.content);
    } else {
      printWindow.document.write(`
        <html>
          <head>
            <title>${artifact.title}</title>
            <style>
              body { font-family: -apple-system, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              h1, h2, h3 { color: #138A4D; }
              blockquote { border-left: 3px solid #138A4D; padding-left: 14px; font-style: italic; color: #444; }
            </style>
          </head>
          <body>
            <div>${artifact.content.replace(/\n/g, '<br/>')}</div>
          </body>
        </html>
      `);
    }
    printWindow.document.close();
    printWindow.print();
  };

  const startDragResize = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div
      className="artifact-pane"
      style={{
        width: isFullscreen ? '100%' : `${paneWidth}px`,
        position: isFullscreen ? 'absolute' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 50 : 10
      }}
    >
      {/* Resizable Drag Handle on Left Border */}
      {!isFullscreen && (
        <div
          onMouseDown={startDragResize}
          title="Drag to resize Artifact Workspace"
          style={{
            position: 'absolute',
            left: '-4px',
            top: 0,
            bottom: 0,
            width: '8px',
            cursor: 'ew-resize',
            zIndex: 30
          }}
        />
      )}

      {/* Header Bar */}
      <div style={{
        height: '56px',
        padding: '0 18px',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            background: 'rgba(71, 185, 119, 0.18)',
            color: 'var(--brand-green-light)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)'
          }}>
            Artifact Workspace
          </span>
          <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--brand-cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {artifact.title}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-hover)',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                background: viewMode === 'preview' ? 'linear-gradient(135deg, var(--brand-green-dark), var(--brand-green-light))' : 'transparent',
                color: viewMode === 'preview' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 9px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Eye size={12} /> Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              style={{
                background: viewMode === 'code' ? 'linear-gradient(135deg, var(--brand-green-dark), var(--brand-green-light))' : 'transparent',
                color: viewMode === 'code' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 9px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Code size={12} /> Source
            </button>
          </div>

          <button
            onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            title="View Security Isolation Details"
            style={{ background: 'transparent', border: 'none', color: 'var(--brand-green-light)', cursor: 'pointer', padding: '4px' }}
          >
            <ShieldCheck size={16} />
          </button>

          <button
            onClick={handleCopy}
            title="Copy Content"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            {copied ? <Check size={16} color="var(--brand-green-light)" /> : <Copy size={16} />}
          </button>

          <button
            onClick={handleDownload}
            title={`Download as ${isHtml ? 'HTML' : 'Markdown'}`}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <Download size={16} />
          </button>

          <button
            onClick={handlePrintPdf}
            title="Print / Export to PDF"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <Printer size={16} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Workspace"}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={onClose}
            title="Close Workspace"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Security Info Banner */}
      {showSecurityInfo && (
        <div style={{
          background: 'rgba(19, 138, 77, 0.15)',
          borderBottom: '1px solid var(--border-active)',
          padding: '12px 18px',
          fontSize: '12px',
          color: 'var(--text-main)',
          flexShrink: 0
        }}>
          <strong style={{ color: 'var(--brand-green-light)' }}>Security & Sandbox Architecture:</strong>
          <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
            <li><strong>Isolation:</strong> Rendered in sandboxed <code>&lt;iframe sandbox="allow-scripts allow-popups allow-forms"&gt;</code>.</li>
            <li><strong>Sanitization:</strong> Backend applies <code>bleach</code> HTML tag & attribute whitelist.</li>
            <li><strong>Blocked:</strong> External <code>&lt;script&gt;</code> tags, <code>javascript:</code> execution, inline event handlers (<code>onclick</code>, <code>onerror</code>).</li>
          </ul>
        </div>
      )}

      {/* Body Viewer */}
      <div style={{ flex: 1, height: 'calc(100% - 56px)', background: 'var(--bg-dark)', overflow: 'hidden' }}>
        {viewMode === 'preview' ? (
          isHtml ? (
            <iframe
              title={artifact.title}
              srcDoc={artifact.content}
              sandbox="allow-scripts allow-popups allow-forms"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'var(--bg-card-solid)'
              }}
            />
          ) : (
            <div style={{ height: '100%', overflowY: 'auto', padding: '28px' }}>
              <div className="markdown-body" style={{ whiteSpace: 'pre-wrap' }}>
                {artifact.content}
              </div>
            </div>
          )
        ) : (
          <div style={{ height: '100%', overflowY: 'auto', padding: '18px' }}>
            <pre><code>{artifact.content}</code></pre>
          </div>
        )}
      </div>
    </div>
  );
}
