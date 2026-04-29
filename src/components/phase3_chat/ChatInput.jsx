import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import NudgeCard from '../phase5_nudge/NudgeCard';

const ChatInput = ({
  sendMessage,
  isLoading,
  activeNudge,
  isPreparingNudge,
  onActivate,
  onPreview,
  onDismiss,
  onInputChange
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (onInputChange) {
      onInputChange(value);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-[740px] mx-auto px-4 pb-4">
      {activeNudge ? (
        <NudgeCard
          activeNudge={activeNudge}
          onActivate={onActivate}
          onPreview={onPreview}
          onDismiss={onDismiss}
        />
      ) : null}
      
      <div 
        className={`bg-[#232323] border border-[#2e2e2e] rounded-[11px] p-2 flex items-end gap-2 ${
          isLoading ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you?"
          className="flex-1 bg-transparent border-none outline-none text-[#c8c8c8] text-[15px] py-[7px] px-[10px] resize-none max-h-[200px] overflow-y-auto"
        />
        
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`w-[27px] h-[27px] rounded-[6px] flex items-center justify-center shrink-0 transition-colors ${
            input.trim() && !isLoading ? 'bg-accent text-white' : 'bg-[#333] text-[#555]'
          }`}
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
