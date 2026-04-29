import React from 'react';
import SkillList from './SkillList';
import SkillDetail from './SkillDetail';

const SkillsSection = ({ skills = [], activeSkill, onActivate, onBack, onSave, onToggleSkill, onSelectSkill, onToggleReference }) => {
  return (
    <div className="flex-1 flex" style={{ height: '100%', overflow: 'hidden' }} data-testid="skills-section">
      {/* Left Nav Panel */}
      <div style={{ width: '180px', background: '#1a1a1a', borderRight: '0.5px solid #222', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Customize
        </div>
        <div className="flex-1">
          <div style={{ padding: '8px 20px', color: '#CF643F', fontSize: '13px', fontWeight: '500', background: 'rgba(207,100,63,0.05)', borderRight: '2px solid #CF643F', cursor: 'pointer' }}>
            Skills
          </div>
          <div style={{ padding: '8px 20px', color: '#666', fontSize: '13px', cursor: 'not-allowed' }}>
            Connectors
          </div>
        </div>
        <div 
          onClick={onBack}
          style={{ padding: '24px 20px', color: '#666', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          data-testid="back-to-chat-btn"
        >
          <span>←</span> Back to chat
        </div>
      </div>

      {/* Middle Panel */}
      <div style={{ width: '280px', background: '#1a1a1a', borderRight: '0.5px solid #222', display: 'flex', flexDirection: 'column' }}>
        <SkillList 
          skills={skills} 
          activeSkill={activeSkill} 
          onSelectSkill={onSelectSkill}
          onToggleSkill={onToggleSkill} 
        />
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, background: '#1a1a1a', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {activeSkill ? (
          <SkillDetail 
            skill={activeSkill} 
            onActivate={onActivate} 
            onSave={onSave}
            onToggleSkill={onToggleSkill} 
            onToggleReference={onToggleReference}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '13px' }}>
            Select a skill to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
