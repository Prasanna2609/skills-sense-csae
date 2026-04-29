import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatArea = ({ messages, isLoading, skillBadge }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div style={{ color: '#CF643F' }} className="text-[24px] font-serif leading-none">✳</div>
          <h1 className="text-[#d4cfc8] text-[26px] font-serif tracking-wide">Good morning</h1>
        </div>
        {/* Placeholder for center area when no messages */}
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-[14px] pt-[30px] pb-[10px] flex flex-col"
    >
      <div className="max-w-[700px] w-full mx-auto">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={index} 
            role={msg.role} 
            content={msg.content} 
            skillActive={msg.skillActive}
            skillName={skillBadge?.name}
          />
        ))}
        {isLoading ? (
          <div className="flex justify-start mb-6">
            <div style={{ backgroundColor: '#CF643F', color: '#fff' }} className="w-[27px] h-[27px] shrink-0 rounded-[4px] flex items-center justify-center text-[14px]">
              ✳
            </div>
            <div style={{ color: '#CF643F' }} className="ml-3 px-3 py-[9px] text-[12px] animate-pulse">
              thinking...
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatArea;
