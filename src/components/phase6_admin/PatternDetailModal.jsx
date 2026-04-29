import React from 'react';

const PatternDetailModal = ({ pattern, onClose }) => {
  if (!pattern) return null;

  const calculateConfidence = (counter) => {
    if (counter === 0) return 0;
    if (counter >= 3) return 1;
    return counter / 3;
  };
  const confidencePercent = calculateConfidence(pattern.counter);

  // Compute matched anchors dynamically based on matchedPrompts
  const computeMatchedAnchors = () => {
    if (!pattern.matchedPrompts || pattern.matchedPrompts.length === 0) return [];
    return pattern.anchors.filter(anchor => 
      pattern.matchedPrompts.some(prompt => prompt.toLowerCase().includes(anchor.toLowerCase()))
    );
  };
  const matchedAnchors = computeMatchedAnchors();

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div 
        style={{ width: '620px', maxHeight: '88vh', overflowY: 'auto', background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: '12px', padding: '20px', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#555', fontSize: '18px', cursor: 'pointer' }}
        >
          ×
        </button>

        {/* 1. Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#e0dbd5' }}>{pattern.name}</h2>
            <span style={{ background: 'rgba(207,100,63,0.1)', color: '#CF643F', fontSize: '11px', padding: '2px 8px', borderRadius: '12px' }}>
              {pattern.domain}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#555' }}>Detected from your conversation</div>
        </div>

        {/* 2. Why this pattern exists */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', marginBottom: '8px', fontWeight: '600' }}>Why Skill Sense tracks this</div>
          <div style={{ fontSize: '13px', color: '#a0a0a0', lineHeight: '1.5' }}>
            {pattern.why || "Tracking this pattern allows the Contextual Skill Activation Engine to streamline future tasks in this domain."}
          </div>
        </div>

        {/* 3. Live session data */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', marginBottom: '8px', fontWeight: '600' }}>This session</div>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', fontSize: '12px', color: '#a0a0a0' }}>
            <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: '6px', border: '0.5px solid #222' }}>
              <span style={{ color: '#555', marginRight: '6px' }}>Matches:</span> 
              <span style={{ color: '#e0dbd5' }}>{pattern.counter}/3</span>
            </div>
            <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: '6px', border: '0.5px solid #222' }}>
              <span style={{ color: '#555', marginRight: '6px' }}>Confidence:</span> 
              <span style={{ color: '#e0dbd5' }}>{Math.round(confidencePercent * 100)}%</span>
            </div>
            <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: '6px', border: '0.5px solid #222' }}>
              <span style={{ color: '#555', marginRight: '6px' }}>Stage:</span> 
              <span style={{ color: '#e0dbd5' }}>{pattern.stage}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(!pattern.matchedPrompts || pattern.matchedPrompts.length === 0) ? (
              <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>No matches detected yet in this session</div>
            ) : (
              pattern.matchedPrompts.map((prompt, idx) => {
                const cleanPrompt = prompt.replace(/^["']|["']$/g, '');
                return (
                  <div key={idx} style={{ background: '#1a1a1a', borderLeft: '2px solid #CF643F', padding: '6px 10px', fontSize: '11px', color: '#888' }}>
                    {cleanPrompt}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Detection signals */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', marginBottom: '8px', fontWeight: '600' }}>Signals detected from your conversation</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {pattern.anchors.map((anchor, idx) => {
              const isMatched = matchedAnchors.includes(anchor);
              return (
                <span 
                  key={idx} 
                  title={isMatched ? "Detected in your conversation" : "Not yet detected"}
                  style={{
                    background: isMatched ? 'rgba(207,100,63,0.1)' : '#1a1a1a',
                    border: `0.5px solid ${isMatched ? '#CF643F' : '#2a2a2a'}`,
                    color: isMatched ? '#CF643F' : '#666',
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'default'
                  }}
                  data-testid="anchor-pill"
                >
                  {anchor}
                </span>
              );
            })}
          </div>
        </div>

        {/* 5. Nudge copy preview */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', marginBottom: '8px', fontWeight: '600' }}>How Skill Sense will nudge you</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: '#1a1a1a', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', color: '#888' }}>
              <div style={{ color: '#555', fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px' }}>First suggestion (N1)</div>
              {pattern.nudges.n1}
            </div>
            <div style={{ background: '#1a1a1a', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', color: '#888' }}>
              <div style={{ color: '#555', fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px' }}>If dismissed once (N2)</div>
              {pattern.nudges.n2}
            </div>
            <div style={{ background: '#1a1a1a', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', color: '#888' }}>
              <div style={{ color: '#555', fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px' }}>Final attempt (N3)</div>
              {pattern.nudges.n3}
            </div>
          </div>
        </div>

        {/* 6. Example phrasings */}
        <div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', marginBottom: '8px', fontWeight: '600' }}>Example prompts that trigger this</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pattern.examples?.map((ex, idx) => (
              <div key={idx} style={{ color: '#666', fontSize: '11.5px', display: 'flex', gap: '6px' }}>
                <span style={{ color: '#CF643F' }}>›</span> {ex}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatternDetailModal;
