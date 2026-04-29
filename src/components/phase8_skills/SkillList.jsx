import React, { useState } from 'react';

const SkillList = ({ skills = [], activeSkill, onSelectSkill, onToggleSkill }) => {
  const [expandedSkills, setExpandedSkills] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [modalFile, setModalFile] = useState(null);

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedSkills(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFolder = (e, id) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };
  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ fontSize: '13px', color: '#e0dbd5', fontWeight: '500', marginBottom: '20px', paddingLeft: '4px' }}>
        Skills
      </div>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', marginBottom: '10px', paddingLeft: '4px', fontWeight: '600' }}>
        Personal Skills
      </div>

      {skills.length === 0 ? (
        <div style={{ padding: '20px 4px', fontSize: '12px', color: '#666', lineHeight: '1.5' }} data-testid="skill-list-empty">
          No Skills yet. Activate a Skill from the nudge card to see it here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {skills.map((skill, index) => {
            const isActive = activeSkill?.id === skill.id;
            const isOn = skill.status === 'activated';
            return (
              <div 
                key={skill.patternId || skill.name || index}
                onClick={() => onSelectSkill && onSelectSkill(skill)}
                data-testid={`skill-item-${skill.id}`}
                style={{
                  background: isActive ? 'rgba(207,100,63,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #CF643F' : '2px solid transparent',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span 
                      onClick={(e) => toggleExpand(e, skill.id)}
                      style={{ 
                        transform: expandedSkills[skill.id] ? 'rotate(90deg)' : 'none', 
                        transition: 'transform 0.2s', 
                        display: 'inline-block', 
                        color: '#888',
                        fontSize: '14px',
                        width: '12px',
                        textAlign: 'center'
                      }}
                    >
                      ›
                    </span>
                    <div style={{ fontSize: '12.5px', color: '#c8c8c8', fontWeight: isActive ? '500' : 'normal' }}>
                      {skill.name}
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSkill && onToggleSkill(skill); }}
                    style={{
                      width: '24px', height: '14px', borderRadius: '10px',
                      background: isOn ? '#CF643F' : '#333',
                      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0
                    }}
                    data-testid={`skill-toggle-${skill.id}`}
                  >
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: '2px', left: isOn ? '12px' : '2px', transition: 'left 0.2s'
                    }}/>
                  </div>
                </div>
                <div>
                  <span style={{
                    fontSize: '9px', background: 'rgba(207,100,63,0.1)', color: '#CF643F',
                    borderRadius: '3px', padding: '2px 5px', display: 'inline-block'
                  }}>
                    Suggested by Skill Sense
                  </span>
                </div>

                {expandedSkills[skill.id] ? (
                  <div style={{ paddingLeft: '18px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setModalFile({ name: 'SKILL.md', content: skill.systemPrompt }); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#888', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: '12px' }}>📄</span> SKILL.md
                    </div>
                    <div 
                      onClick={(e) => toggleFolder(e, skill.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#888', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: '12px' }}>📁</span> references/
                    </div>
                    {expandedFolders[skill.id] ? (
                      <div style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div 
                          onClick={(e) => { e.stopPropagation(); setModalFile({ name: 'examples.md', content: skill.references?.examples }); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#888', cursor: 'pointer' }}
                        >
                          <span style={{ fontSize: '12px' }}>📄</span> examples.md
                        </div>
                        <div 
                          onClick={(e) => { e.stopPropagation(); setModalFile({ name: 'guidelines.md', content: skill.references?.guidelines }); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#888', cursor: 'pointer' }}
                        >
                          <span style={{ fontSize: '12px' }}>📄</span> guidelines.md
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalFile ? (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}
          onClick={() => setModalFile(null)}
          data-testid="file-modal"
        >
          <div 
            style={{
              width: '560px',
              background: '#161616',
              border: '0.5px solid #2a2a2a',
              borderRadius: '10px',
              padding: '20px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0' }}>
              <div style={{ fontSize: '13px', color: '#e0dbd5' }}>{modalFile.name}</div>
              <button 
                onClick={() => setModalFile(null)}
                style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '16px', cursor: 'pointer' }}
                data-testid="close-modal"
              >
                ×
              </button>
            </div>
            <pre style={{
              background: '#111',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '11.5px',
              color: '#888',
              lineHeight: '1.6',
              maxHeight: '400px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {modalFile.content || "No content available."}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SkillList;
