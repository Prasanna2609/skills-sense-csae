import React, { useState } from 'react';
import QuickEdit from '../phase9_editing/QuickEdit';

const SkillDetail = ({ skill, onActivate, onSave, onToggleSkill, onToggleReference }) => {
  const [modalFile, setModalFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const isOn = skill.status === 'activated';

  return (
    <div style={{ padding: '36px 40px', maxWidth: '700px', width: '100%', margin: '0 auto' }} data-testid="skill-detail">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', color: '#e0dbd5', fontWeight: '500', margin: 0 }}>{skill.name}</h2>
        <div 
          onClick={() => onToggleSkill && onToggleSkill(skill)}
          style={{
            width: '32px', height: '18px', borderRadius: '10px',
            background: isOn ? '#CF643F' : '#333',
            position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
          }}
          data-testid="detail-toggle"
        >
          <div style={{
            width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
            position: 'absolute', top: '2px', left: isOn ? '16px' : '2px', transition: 'left 0.2s'
          }}/>
        </div>
      </div>

      {/* Metadata Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '0.5px solid #2a2a2a' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>Added by</div>
          <div style={{ fontSize: '11px', color: '#888' }}>Skill Sense</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>Created</div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {skill.timestamp ? new Date(skill.timestamp).toLocaleDateString() : 'Just now'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>Trigger</div>
          <div style={{ fontSize: '11px', color: '#888' }}>{skill.domain || 'Global'}</div>
        </div>
      </div>

      {isEditing ? (
        <QuickEdit 
          skill={skill}
          onSave={(newText) => {
            onSave(newText);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          onToggleReference={onToggleReference}
        />
      ) : (
        <>
          {/* Description */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', color: '#e0dbd5', marginBottom: '12px', fontWeight: '500' }}>About this Skill</div>
            <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.6', background: '#141414', padding: '16px', borderRadius: '8px', border: '0.5px solid #2a2a2a' }}>
              {skill.systemPrompt || "No system prompt generated yet."}
            </div>
          </div>

          {/* Reference Files */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', marginBottom: '12px', fontWeight: '600' }}>Reference Files</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['examples.md', 'guidelines.md'].map(filename => {
                const fileKey = filename.split('.')[0];
                return (
                  <div 
                    key={filename} 
                    onClick={() => setModalFile(fileKey)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c1c1c', padding: '12px 16px', borderRadius: '8px', border: '0.5px solid #2a2a2a', cursor: 'pointer' }}
                    data-testid={`ref-file-${fileKey}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#555' }}>📄</span>
                      <span style={{ fontSize: '12px', color: '#bbb' }}>{filename}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', color: '#555' }}>Included in responses when ON</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => setIsEditing(true)}
              data-testid="quick-edit-btn"
              style={{ background: '#CF643F', color: '#fff', fontSize: '12px', fontWeight: '500', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            >
              Quick Edit
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowComingSoon(true)}
                style={{ background: 'transparent', border: '0.5px solid #333', color: '#666', fontSize: '12px', fontWeight: '500', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }} 
                data-testid="edit-claude-btn"
              >
                Edit with Claude
              </button>
              {showComingSoon ? (
                <div style={{ fontSize: '10px', color: '#aaa', position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '4px' }}>
                  Coming Soon
                </div>
              ) : null}
            </div>
            
            {!isOn ? (
              <button 
                onClick={() => onActivate && onActivate(skill)}
                style={{ marginLeft: 'auto', background: '#CF643F', color: '#fff', fontSize: '12px', fontWeight: '500', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                Activate Skill
              </button>
            ) : null}
          </div>
        </>
      )}

      {/* Modal */}
      {modalFile ? (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}
          data-testid="file-modal"
        >
          <div style={{
            width: '560px',
            background: '#161616',
            border: '0.5px solid #2a2a2a',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#e0dbd5' }}>{modalFile}.md</div>
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
              {skill.references?.[modalFile] || "No content available."}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SkillDetail;
