// Phase 2 — Layout Shell
import React from 'react';

export default function Tooltip({ children, text }) {
  return (
    <div className="group relative flex items-center w-full">
      {children}
      <div 
        className="absolute left-full ml-2 hidden group-hover:flex items-center z-50 whitespace-nowrap"
        style={{
          background: '#1a1a1a',
          border: '0.5px solid #222',
          color: '#666',
          fontSize: '10px',
          padding: '4px 8px',
          borderRadius: '4px'
        }}
      >
        {text}
      </div>
    </div>
  );
}
