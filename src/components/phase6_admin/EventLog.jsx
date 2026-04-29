import React from 'react';

const EventLog = ({ eventLog = [] }) => {
  if (!eventLog || eventLog.length === 0) return null;

  // Max 10 events shown — oldest dropped if over 10
  const displayEvents = eventLog.slice(-10);

  const getEventColor = (type) => {
    switch (type) {
      case 'threshold': return '#555';
      case 'generated': return '#CF643F';
      case 'nudge': return '#777';
      case 'activated': return '#4CAF50';
      default: return '#555';
    }
  };

  const formatTime = (timeMs) => {
    const d = new Date(timeMs);
    return d.toTimeString().split(' ')[0]; // HH:MM:SS
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', margin: '10px 10px 6px', fontWeight: '600' }}>Event Log</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {displayEvents.map((evt, idx) => (
          <div key={idx} style={{ display: 'flex', padding: '3px 10px', fontSize: '10px' }}>
            <span style={{ color: '#555', marginRight: '8px', minWidth: '45px' }}>
              {formatTime(evt.time)}
            </span>
            <span style={{ color: getEventColor(evt.type) }}>
              {evt.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLog;
