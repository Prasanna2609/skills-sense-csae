import React, { useState, useRef, useEffect } from 'react';

const QuickEdit = ({ skill, onSave, onCancel, onToggleReference }) => {
  const [promptText, setPromptText] = useState(skill.systemPrompt || '');
  const [isFocused, setIsFocused] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const textareaRef = useRef(null);

  const examplesEnabled = skill.references?.examplesEnabled;
  const guidelinesEnabled = skill.references?.guidelinesEnabled;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [promptText]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setUploadedFile({
          name: file.name,
          preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
        });
        onToggleReference('guidelines', true, content);
      };
      reader.readAsText(file);
    }
  };

  const activeChipStyle = { background: 'rgba(207,100,63,0.1)', border: '0.5px solid rgba(207,100,63,0.3)', color: '#CF643F' };
  const inactiveChipStyle = { background: '#161616', border: '0.5px solid #222', color: '#555' };

  return (
    <div data-testid="quick-edit-section">
      <textarea
        data-testid="quick-edit-textarea"
        ref={textareaRef}
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          background: '#111',
          border: `0.5px solid ${isFocused ? 'rgba(207,100,63,0.4)' : '#2a2a2a'}`,
          borderRadius: '8px',
          padding: '12px',
          fontSize: '12px',
          color: '#c8c8c8',
          lineHeight: '1.6',
          fontFamily: 'monospace',
          minHeight: '120px',
          width: '100%',
          resize: 'none',
          outline: 'none',
          marginBottom: '20px'
        }}
      />

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#444', marginBottom: '12px', fontWeight: '600' }}>
          Reference examples from past sessions
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button 
            data-testid="chip-examples"
            onClick={() => onToggleReference('examples', !examplesEnabled)}
            style={{
              padding: '6px 12px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', outline: 'none',
              ...(examplesEnabled ? activeChipStyle : inactiveChipStyle)
            }}
          >
            examples.md
          </button>
          <button 
            data-testid="chip-guidelines"
            onClick={() => onToggleReference('guidelines', !guidelinesEnabled)}
            style={{
              padding: '6px 12px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', outline: 'none',
              ...(guidelinesEnabled ? activeChipStyle : inactiveChipStyle)
            }}
          >
            guidelines.md
          </button>
        </div>

        <div style={{ position: 'relative' }} data-testid="file-upload-section">
          <input 
            type="file" 
            accept=".md" 
            onChange={handleFileUpload}
            style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          />
          <div style={{
            border: '0.5px dashed #2a2a2a',
            padding: '8px',
            borderRadius: '6px',
            color: '#555',
            fontSize: '11px',
            textAlign: 'center',
            background: '#141414'
          }}>
            Drop .md file here or click to upload
          </div>
        </div>
        {uploadedFile && (
          <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(76, 175, 80, 0.08)', border: '0.5px solid rgba(76, 175, 80, 0.2)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4CAF50', fontSize: '11px', fontWeight: '500', marginBottom: '6px' }}>
              <span>✓</span> {uploadedFile.name} — Added to guidelines
            </div>
            <div style={{ fontSize: '10px', color: '#888', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.4' }}>
              {uploadedFile.preview}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          data-testid="quick-edit-save"
          onClick={() => onSave(promptText)}
          style={{ background: '#CF643F', color: 'white', fontSize: '12px', fontWeight: '500', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
        >
          Save Changes
        </button>
        <button 
          data-testid="quick-edit-cancel"
          onClick={onCancel}
          style={{ background: 'transparent', color: '#555', fontSize: '12px', fontWeight: '500', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QuickEdit;
