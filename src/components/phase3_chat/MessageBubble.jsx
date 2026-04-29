import React from 'react';
import SkillBadge from '../phase10_polish/SkillBadge';

const MessageBubble = ({ role, content, skillActive, skillName }) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        {/* Avatar */}
        <div 
          className={`w-[27px] h-[27px] shrink-0 rounded-[4px] flex items-center justify-center text-[14px] ${
            isAssistant 
              ? 'bg-accent text-white' 
              : 'bg-[#252525] border border-[#333]'
          }`}
        >
          {isAssistant ? '✳' : ''}
        </div>

        {/* Bubble Area */}
        <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
          {isAssistant && skillActive ? (
            <SkillBadge skillActive={skillActive} skillName={skillName} />
          ) : null}
          <div 
            className={`px-3 py-[9px] rounded-[9px] text-[12px] leading-[1.55] text-[#c8c8c8] ${
              isAssistant 
                ? 'bg-[#252525] border border-[#2e2e2e]' 
                : 'bg-[rgba(207,100,63,0.09)] border border-[rgba(207,100,63,0.18)]'
            }`}
          >
            <div className="whitespace-pre-wrap">{content}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
