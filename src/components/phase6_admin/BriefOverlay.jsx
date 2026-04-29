import React, { useState } from 'react';
import PatternDetailModal from './PatternDetailModal';

const calculateConfidence = (counter) => {
  if (counter === 0) return 0;
  if (counter >= 3) return 1;
  return counter / 3;
};

const getConfidenceColor = (percent, stage) => {
  if (percent === 0) return '#333';
  if (percent >= 1 && stage === 'activated') return '#4CAF50';
  return '#CF643F';
};

const getBadgeStyle = (stage) => {
  switch (stage) {
    case 'monitoring': return { background: '#1a1a1a', color: '#555', text: 'monitoring' };
    case 'nudge-ready': return { background: 'rgba(207,100,63,0.12)', color: '#CF643F', text: 'nudge ready' };
    case 'activated': return { background: 'rgba(76,175,80,0.12)', color: '#4CAF50', text: 'activated' };
    case 'snoozed': return { background: '#111', color: '#555', text: 'snoozed' };
    case 'archived': return { background: '#111', color: '#333', text: 'archived' };
    default: return { background: '#1a1a1a', color: '#555', text: stage };
  }
};

const BriefOverlay = ({ briefOpen, setBriefOpen, patterns = [], sessionStats }) => {
  const [selectedPattern, setSelectedPattern] = useState(null);

  if (!briefOpen) return null;

  console.log('BriefOverlay stats:', sessionStats);

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: '#0d0d0d', zIndex: 60 }}
      onClick={() => setBriefOpen(false)}
      data-testid="brief-overlay"
    >
      <div 
        style={{ maxWidth: '1100px', margin: 'auto', height: '100vh', overflowY: 'auto', padding: '24px', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setBriefOpen(false)}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#555', fontSize: '20px', cursor: 'pointer' }}
          data-testid="close-brief-btn"
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#e0dbd5', margin: '0' }}>Skill Sense — Detection Summary</h1>
          
          <div style={{
            background: 'rgba(207,100,63,0.08)',
            border: '0.5px solid rgba(207,100,63,0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
            margin: '10px 0 16px'
          }}>
            <div style={{fontSize: '11px', color: '#CF643F', fontWeight: 500, marginBottom: '3px'}}>
              Review Mode — Skill Sense Admin
            </div>
            <div style={{fontSize: '11px', color: '#777', lineHeight: 1.5}}>
              This overlay shows what the CSAE (Contextual Skill Activation Engine) detects in the background during a real user session. This view is never visible to end users — it exists solely to demonstrate how Skill Sense identifies behavioral patterns and decides when to surface a Skill suggestion.
            </div>
          </div>
        </div>

        {/* Session Stats Row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#161616', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '7px 9px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#e0dbd5' }}>{sessionStats?.promptsSent || 0}</div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>Prompts Sent</div>
          </div>
          <div style={{ background: '#161616', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '7px 9px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#e0dbd5' }}>10</div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>Patterns Tracked</div>
          </div>
          <div style={{ background: '#161616', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '7px 9px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#e0dbd5' }}>{sessionStats?.skillsCreated || 0}</div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>Skills Created</div>
          </div>
        </div>

        {/* Pattern Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {patterns.map((pattern) => {
            const confidencePercent = calculateConfidence(pattern.counter);
            const confidenceColor = getConfidenceColor(confidencePercent, pattern.stage);
            const badgeObj = getBadgeStyle(pattern.stage);
            
            // Compute matched anchors dynamically
            const matchedAnchors = (!pattern.matchedPrompts || pattern.matchedPrompts.length === 0) 
              ? [] 
              : pattern.anchors.filter(anchor => 
                  pattern.matchedPrompts.some(prompt => prompt.toLowerCase().includes(anchor.toLowerCase()))
                );

            const pillsToShow = pattern.anchors.slice(0, 5);

            return (
              <div 
                key={pattern.id} 
                onClick={() => setSelectedPattern(pattern)}
                style={{ background: '#161616', border: '0.5px solid #222', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                data-testid={`brief-pattern-${pattern.id}`}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#c8c8c8' }}>{pattern.name}</div>
                  <span style={{ 
                    background: badgeObj.background, 
                    color: badgeObj.color, 
                    padding: '2px 5px', 
                    borderRadius: '3px',
                    fontSize: '9px',
                  }}>
                    {badgeObj.text}
                  </span>
                </div>

                {/* Confidence bar */}
                <div style={{ height: '3px', background: '#222', borderRadius: '2px', margin: '3px 0 8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: confidenceColor, width: `${confidencePercent * 100}%` }} />
                </div>

                {/* This session row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginBottom: '8px' }}>
                  <span>Matches: {pattern.counter}/3</span>
                  <span>Confidence: {Math.round(confidencePercent * 100)}%</span>
                </div>

                {/* Content / Prompts */}
                <div style={{ flex: 1, marginBottom: '12px' }}>
                  {pattern.counter > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pattern.matchedPrompts?.map((prompt, idx) => (
                        <div key={idx} style={{ background: '#1a1a1a', borderLeft: '2px solid #CF643F', padding: '6px 10px', fontSize: '11px', color: '#888' }} data-testid="brief-matched-prompt">
                          {prompt}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#444', fontStyle: 'italic', padding: '6px 0' }} data-testid="brief-no-activity">
                      No activity this session
                    </div>
                  )}
                </div>

                {/* Stage Skill Created notification */}
                {pattern.stage === 'activated' ? (
                  <div style={{ background: 'rgba(76,175,80,0.1)', border: '0.5px solid rgba(76,175,80,0.2)', color: '#4CAF50', fontSize: '10px', padding: '6px 8px', borderRadius: '4px', marginBottom: '12px', textAlign: 'center' }}>
                    Skill Created: {pattern.name}
                  </div>
                ) : null}

                {/* Signal pills row */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: 'auto' }}>
                  {pillsToShow.map((anchor, idx) => {
                    const isMatched = matchedAnchors.includes(anchor);
                    return (
                      <span 
                        key={idx} 
                        style={{
                          background: isMatched ? 'rgba(207,100,63,0.1)' : '#1a1a1a',
                          border: `0.5px solid ${isMatched ? '#CF643F' : '#2a2a2a'}`,
                          color: isMatched ? '#CF643F' : '#666',
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }}
                      >
                        {anchor}
                      </span>
                    );
                  })}
                  {pattern.anchors.length > 5 ? (
                    <span style={{ color: '#444', fontSize: '9px', padding: '2px 0' }}>+{pattern.anchors.length - 5}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#444', paddingBottom: '20px' }} data-testid="brief-footer">
          This view is for review purposes only — not visible to end users
        </div>

      </div>

      {selectedPattern ? (
        <PatternDetailModal 
          pattern={selectedPattern} 
          onClose={() => setSelectedPattern(null)} 
        />
      ) : null}
    </div>
  );
};

export default BriefOverlay;
