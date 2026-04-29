import React from 'react';

const SessionStats = ({ promptsSent, skillsCreated }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', padding: '0 10px' }}>
      <div style={{ background: '#161616', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '7px 9px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#e0dbd5' }}>{promptsSent}</div>
        <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>Prompts Sent</div>
      </div>
      <div style={{ background: '#161616', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '7px 9px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#e0dbd5' }}>10</div>
        <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>Patterns Tracked</div>
      </div>
      <div style={{ background: '#161616', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '7px 9px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#e0dbd5' }}>{skillsCreated}</div>
        <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>Skills Created</div>
      </div>
    </div>
  );
};

export default SessionStats;
