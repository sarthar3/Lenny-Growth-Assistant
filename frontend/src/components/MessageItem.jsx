import React, { useState } from 'react';
import {
  User, ExternalLink, Layout, Copy, Check, RefreshCw,
  Share2, Printer, Download, BookOpen, Quote
} from 'lucide-react';

export default function MessageItem({
  message,
  onOpenArtifact,
  onOpenCitation,
  onRegenerate
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const isUser = message.role === 'user';
  const hasArtifact = !!message.artifact;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`The Lenny Growth Assistant:\n\n${message.content}`);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([message.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lenny_assistant_response_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Lenny's Growth Assistant Response</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1, h2, h3 { color: #138A4D; }
            blockquote { border-left: 3px solid #138A4D; padding-left: 12px; font-style: italic; color: #444; }
          </style>
        </head>
        <body>
          <div style="font-size: 12px; color: #888; margin-bottom: 20px;">The Lenny Growth Assistant | Verified Transcript Grounding</div>
          <div>${message.content.replace(/\n/g, '<br/>')}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      padding: '20px 24px',
      background: isUser ? 'transparent' : 'rgba(236, 228, 212, 0.45)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      {/* Avatar Icon */}
      <div style={{
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        background: isUser
          ? 'linear-gradient(135deg, #FFB247, #d97706)'
          : 'linear-gradient(135deg, var(--brand-green-dark), var(--brand-green-light))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: isUser
          ? '0 2px 10px rgba(217, 119, 6, 0.25)'
          : '0 2px 10px rgba(19, 138, 77, 0.25)'
      }}>
        {isUser ? (
          <User size={16} color="#ffffff" strokeWidth={2.5} />
        ) : (
          <img src="/logo.svg" alt="Lenny Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
        )}
      </div>

      {/* Main Message Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '5px'
        }}>
          <span style={{
            fontSize: '12.5px',
            fontWeight: '700',
            color: isUser ? 'var(--brand-amber)' : 'var(--brand-green-light)'
          }}>
            {isUser ? 'You' : "The Lenny Growth Assistant"}
          </span>

          {/* Action Toolbar on Assistant Messages */}
          {!isUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleCopy}
                title="Copy response"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
              >
                {copied ? <Check size={13} color="var(--brand-green-light)" /> : <Copy size={13} />}
              </button>
              <button
                onClick={handleShare}
                title="Share response"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
              >
                {shared ? <Check size={13} color="var(--brand-green-light)" /> : <Share2 size={13} />}
              </button>
              <button
                onClick={handleExportMarkdown}
                title="Export as Markdown (.md)"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
              >
                <Download size={13} />
              </button>
              <button
                onClick={handlePrintPdf}
                title="Print or Export to PDF"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
              >
                <Printer size={13} />
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate response"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                >
                  <RefreshCw size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="markdown-body" style={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </div>

        {/* Grounding Citations with clickable inspection */}
        {message.citations && message.citations.length > 0 && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--brand-amber)', marginBottom: '6px' }}>
              GROUNDING SOURCES ({message.citations.length}) — Click to view transcript quote:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {message.citations.map((cit, idx) => (
                <span
                  key={idx}
                  onClick={() => onOpenCitation && onOpenCitation(cit)}
                  className="citation-badge"
                  style={{ cursor: 'pointer' }}
                  title="Click to view full transcript quote & YouTube timestamp"
                >
                  <span>{cit.guest}</span>
                  <span style={{ opacity: 0.75 }}>({cit.timestamp})</span>
                  <ExternalLink size={10} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attached Artifact Trigger Pill */}
        {hasArtifact && (
          <div style={{ marginTop: '14px' }}>
            <button
              onClick={() => onOpenArtifact(message.artifact)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(19, 138, 77, 0.25), rgba(71, 185, 119, 0.2))',
                border: '1px solid var(--border-active)',
                color: 'var(--brand-cream)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 0 18px rgba(71, 185, 119, 0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              <Layout size={15} color="var(--brand-green-light)" />
              <span>Open in Artifact Workspace: {message.artifact.title}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
