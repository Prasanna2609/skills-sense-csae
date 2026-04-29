import React, { useState } from 'react';

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

const PatternCard = ({ pattern, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const confidencePercent = calculateConfidence(pattern.counter);
  const confidenceColor = getConfidenceColor(confidencePercent, pattern.stage);
  const badgeObj = getBadgeStyle(pattern.stage);

  const tagsToShow = pattern.anchors.slice(0, 3);
  const extraTags = pattern.anchors.length > 3 ? pattern.anchors.length - 3 : 0;

  return (
    <div
      onClick={() => onClick(pattern)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? '#1a1a1a' : '#161616',
        border: `0.5px solid ${isHovered ? '#333' : '#222'}`,
        borderRadius: '8px',
        padding: '7px 9px',
        cursor: 'pointer',
        marginBottom: '8px'
      }}
      data-testid={`pattern-card-${pattern.id}`}
    >
      <div style={{ fontSize: '11.5px', fontWeight: '500', color: '#c8c8c8' }}>
        {pattern.name}
      </div>
      
      <div style={{ height: '3px', background: '#222', borderRadius: '2px', margin: '3px 0', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: confidenceColor, width: `${confidencePercent * 100}%` }} data-testid="confidence-bar-fill" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', marginBottom: '8px' }}>
        <span style={{ color: '#555' }}>{Math.round(confidencePercent * 100)}%</span>
        <span style={{ 
          background: badgeObj.background, 
          color: badgeObj.color, 
          padding: '2px 5px', 
          borderRadius: '3px',
          fontSize: '9px',
        }} data-testid={`badge-${pattern.stage}`}>
          {badgeObj.text}
        </span>
      </div>

      {pattern.counter > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', position: 'relative' }}>
          {tagsToShow.map((tag, i) => (
            <span key={i} style={{ background: '#1e1e1e', border: '0.5px solid #2a2a2a', color: '#666', fontSize: '10px', padding: '2px 6px', borderRadius: '3px' }} data-testid="signal-tag">
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span style={{ color: '#444', fontSize: '10px', padding: '2px 0' }}>+{extraTags}</span>
          )}
          <span style={{ position: 'absolute', bottom: '0', right: '0', color: '#CF643F', fontSize: '12px' }}>›</span>
        </div>
      )}
    </div>
  );
};

export default PatternCard;
