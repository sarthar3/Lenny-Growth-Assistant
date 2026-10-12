import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Layers, TrendingUp, Users, DollarSign, Search, ArrowRight } from 'lucide-react';

const PROMPT_CATEGORIES = [
  {
    id: "growth",
    name: "Growth & Retention",
    icon: TrendingUp,
    prompts: [
      {
        title: "Product-Led Growth Loops vs Paid Marketing",
        description: "Compare organic PLG compounding loops against paid performance ad spend using Elena Verna's insights.",
        prompt: "Analyze the trade-offs between product-led growth loops and paid marketing based on Elena Verna's episodes on Lenny's Podcast.",
        mode: "ask_lenny"
      },
      {
        title: "How Superhuman Built a 58% PMF Engine",
        description: "Unpack Rahul Vohra's exact survey methodology to measure and optimize product-market fit.",
        prompt: "Explain Rahul Vohra's product-market fit engine step-by-step from Lenny's podcast transcript.",
        mode: "ask_lenny"
      },
      {
        title: "Ship 30 Essay: Retention Over Acquisition",
        description: "Generate an atomic 1,250-word essay on why retention is the only sustainable growth metric.",
        prompt: "Why Retention is the Single King Metric in Modern Product Growth",
        mode: "ship30"
      }
    ]
  },
  {
    id: "strategy",
    name: "Strategy & Roadmaps",
    icon: Layers,
    prompts: [
      {
        title: "Brian Chesky's Single Roadmap & Details Playbook",
        description: "Why Airbnb abandoned feature pods and returned to a single company-wide roadmap.",
        prompt: "Explain Brian Chesky's rationale for moving Airbnb to a single company roadmap and being deep in the details.",
        mode: "ask_lenny"
      },
      {
        title: "Deep Research: PM Role Evolution",
        description: "Comprehensive multi-guest synthesis comparing Marty Cagan, Shreyas Doshi, and Brian Chesky.",
        prompt: "Synthesize how Marty Cagan, Shreyas Doshi, and Brian Chesky view the product management role, contrasting their arguments.",
        mode: "deep_research"
      },
      {
        title: "Interactive Strategy Canvas",
        description: "Generate an interactive HTML/CSS Strategy Canvas rendered side-by-side with chat.",
        prompt: "Create an interactive HTML Strategy Canvas artifact synthesizing Lenny's frameworks on product strategy.",
        mode: "strategy_canvas"
      },
      {
        title: "Ship 30 Essay: Leading in the Details",
        description: "Write an atomic essay on why modern tech leadership requires micro-detail engagement.",
        prompt: "Why Great Leaders Are Deep in the Details, Not Above Them",
        mode: "ship30"
      }
    ]
  },
  {
    id: "monetization",
    name: "Pricing & Monetization",
    icon: DollarSign,
    prompts: [
      {
        title: "Madhavan Ramanujam on Monetization from Day 1",
        description: "Why you should design products around willingness-to-pay rather than pricing after launch.",
        prompt: "Explain Madhavan Ramanujam's framework for willingness-to-pay and pricing before building from Lenny's Podcast.",
        mode: "ask_lenny"
      },
      {
        title: "Pricing Strategy Canvas",
        description: "Create an interactive HTML pricing architecture canvas based on Lenny's podcast guests.",
        prompt: "Create an interactive Pricing Strategy Canvas based on Madhavan Ramanujam and Patrick Campbell on Lenny's Podcast.",
        mode: "strategy_canvas"
      }
    ]
  }
];

export default function PromptLibraryModal({ isOpen, onClose, onSelectPrompt }) {
  const [activeTab, setActiveTab] = useState("growth");
  const [searchFilter, setSearchFilter] = useState("");

  if (!isOpen) return null;

  const currentCategory = PROMPT_CATEGORIES.find(c => c.id === activeTab) || PROMPT_CATEGORIES[0];

  const filteredPrompts = PROMPT_CATEGORIES.flatMap(cat =>
    cat.prompts.filter(p =>
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase())
    )
  );

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
        maxWidth: '820px',
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
              background: 'linear-gradient(135deg, var(--brand-amber), #b45309)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--brand-cream)', margin: 0 }}>
                Lenny Growth Prompt Library
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Pre-tested tactical prompts, Ship 30 frameworks, and Canvas generators
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

        {/* Search */}
        <div style={{ padding: '16px 24px 10px 24px' }}>
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
            <Search size={16} color="var(--brand-amber)" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search prompt templates by topic, guest, or metric..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Categories Tabs */}
        {!searchFilter && (
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '0 24px 14px 24px',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto'
          }}>
            {PROMPT_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = cat.id === activeTab;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? 'linear-gradient(135deg, var(--brand-green-dark), var(--brand-green-light))' : 'var(--bg-hover)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--brand-green-light)' : 'var(--border-color)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={14} color={isActive ? '#ffffff' : 'var(--brand-green-dark)'} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Prompts Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '10px' }}>
            {(searchFilter ? filteredPrompts : currentCategory.prompts).map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectPrompt(item);
                  onClose();
                }}
                style={{
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--brand-cream)' }}>
                      {item.title}
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: item.mode === 'ship30' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(19, 138, 77, 0.12)',
                      color: item.mode === 'ship30' ? 'var(--brand-amber)' : 'var(--brand-green-dark)'
                    }}>
                      {item.mode.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {item.description}
                  </div>
                </div>
                <ArrowRight size={16} color="var(--brand-green-dark)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
