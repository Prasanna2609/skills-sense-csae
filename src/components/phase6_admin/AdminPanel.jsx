import React from 'react';
import SessionStats from './SessionStats';
import PatternCard from './PatternCard';
import EventLog from './EventLog';

const AdminPanel = ({ patterns = [], promptsSent = 0, skillsCreated = 0, eventLog = [], onPatternClick, onViewDetail }) => {
  return (
    <div style={{ width: '280px', background: '#111', borderLeft: '0.5px solid #1a1a1a', height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ background: 'rgba(207,100,63,0.06)', borderBottom: '0.5px solid rgba(207,100,63,0.15)', padding: '8px 10px', marginBottom: '10px' }} data-testid="reviewer-disclaimer">
        <div style={{ fontSize: '10px', color: '#CF643F', fontWeight: '500', marginBottom: '4px' }}>Skill Sense — Admin View</div>
        <div style={{ fontSize: '9px', color: '#555', lineHeight: '1.4' }}>This panel shows how the CSAE (Contextual Skill Activation Engine) detects patterns in the background. Not visible to end users.</div>
      </div>

      <SessionStats promptsSent={promptsSent} skillsCreated={skillsCreated} />

      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', margin: '10px 10px 6px', fontWeight: '600' }}>Patterns</div>
      
      <div style={{ padding: '0 10px', flex: 1 }}>
        {patterns.map((pattern) => (
          <PatternCard key={pattern.id} pattern={pattern} onClick={onPatternClick} />
        ))}
      </div>

      <EventLog eventLog={eventLog} />

      <button
        onClick={onViewDetail}
        data-testid="view-in-detail-btn"
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#555'; }}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderTop: '0.5px solid #222',
          borderBottom: '0.5px solid #222',
          color: '#555',
          padding: '8px',
          fontSize: '11px',
          cursor: 'pointer',
          marginTop: 'auto'
        }}
      >
        View in Detail
      </button>
    </div>
  );
};

export default AdminPanel;
