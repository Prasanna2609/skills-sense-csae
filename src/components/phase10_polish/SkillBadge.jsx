import React from 'react';

const SkillBadge = ({ skillActive, skillName }) => {
  if (!skillActive) return null;

  let displayName = skillName || 'Skill';
  if (!displayName.trim().endsWith('Skill')) {
    displayName = `${displayName.trim()} Skill`;
  }

  return (
    <div 
      data-testid="skill-badge"
      style={{
        display: 'inline-block',
        background: 'rgba(207,100,63,0.1)',
        border: '0.5px solid rgba(207,100,63,0.25)',
        borderRadius: '4px',
        padding: '2px 8px',
        marginBottom: '4px',
        fontSize: '10px',
        color: '#CF643F'
      }}
    >
      ✳ {displayName} — active
    </div>
  );
};

export default SkillBadge;
