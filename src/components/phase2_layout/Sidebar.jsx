// Phase 2 — Layout Shell + Phase 6A — Chat History
import React, { useState } from 'react';
import { Search, MessageSquare, Folder, Zap, Plus, Settings2, X } from 'lucide-react';
import Tooltip from '../shared/Tooltip';
import { getRelativeTime } from '../../hooks/useChatHistory';

export default function Sidebar({
  adminVisible,
  toggleAdmin,
  chats = [],
  currentChatId,
  onNewChat,
  onLoadChat,
  onDeleteChat
}) {
  const [hoveredChatId, setHoveredChatId] = useState(null);

  return (
    <div className="w-[240px] bg-[#1a1a1a] border-r-[0.5px] border-[#2a2a2a] h-full flex flex-col flex-shrink-0">
      <div className="p-4 flex flex-col gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-accent text-[18px] leading-none font-serif">✳</span>
          <span className="text-[#e8e8e8] text-[15px] font-serif tracking-wide">Claude</span>
        </div>

        {/* New Chat */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full py-2 px-3 rounded-md border border-[#333] text-[#e8e8e8] hover:bg-[#2a2a2a] transition-colors text-sm"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        {/* Navigation */}
        <div className="flex flex-col mt-2">
          <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] rounded-md transition-colors text-[#888]">
            <Search size={16} />
            <span className="text-sm">Search</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] rounded-md transition-colors text-[#888]">
            <MessageSquare size={16} />
            <span className="text-sm">Chats</span>
          </div>

          <Tooltip text="Not in scope for this demo">
            <div className="flex items-center gap-2 px-3 py-2 opacity-40 cursor-not-allowed w-full text-[#888]">
              <Folder size={16} />
              <span className="text-sm">Projects</span>
            </div>
          </Tooltip>

          <div className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors text-accent bg-accent/5 mt-1">
            <Zap size={16} fill="currentColor" className="opacity-80" />
            <span className="text-sm font-medium">Skills</span>
          </div>
        </div>

        {/* Recent Chats */}
        <div className="flex flex-col mt-6">
          <div className="px-3 text-xs font-semibold text-[#888] mb-2">Recents</div>
          <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[280px]">
            {chats.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-[#555] italic">
                Your conversations will appear here
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = chat.id === currentChatId;
                const isHovered = chat.id === hoveredChatId;

                return (
                  <div
                    key={chat.id}
                    data-testid={`chat-item-${chat.id}`}
                    onClick={() => onLoadChat(chat.id)}
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                    className="group relative flex items-center justify-between px-3 py-[6px] rounded-md cursor-pointer transition-colors"
                    style={{
                      background: isActive
                        ? 'rgba(207,100,63,0.06)'
                        : isHovered
                        ? '#1e1e1e'
                        : 'transparent',
                      borderLeft: isActive ? '2px solid #CF643F' : '2px solid transparent'
                    }}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className="text-[13px] truncate"
                        style={{ color: isActive ? '#e0dbd5' : '#888' }}
                      >
                        {chat.title.length > 35
                          ? chat.title.slice(0, 35) + '…'
                          : chat.title}
                      </span>
                      <span className="text-[10px] text-[#555] mt-[1px]">
                        {getRelativeTime(chat.updatedAt)}
                      </span>
                    </div>

                    {/* Delete button — visible on hover */}
                    {isHovered && (
                      <button
                        data-testid={`delete-chat-${chat.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="ml-1 p-[2px] rounded hover:bg-[#333] transition-colors text-[#555] hover:text-[#999] shrink-0"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-4 flex flex-col gap-3 border-t-[0.5px] border-[#222]">
        <button 
          onClick={toggleAdmin}
          className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all border ${
            adminVisible 
              ? 'border-accent/35 text-accent bg-accent/5' 
              : 'border-[#333] text-[#888] hover:bg-[#2a2a2a]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings2 size={16} />
            <span>Admin View</span>
          </div>
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">{adminVisible ? 'ON' : 'OFF'}</span>
        </button>
        <div style={{ fontSize: '10px', color: '#3a3a3a', textAlign: 'center', marginTop: '4px' }}>Review mode · not visible to end users</div>

        <div className="flex items-center gap-2 px-1 cursor-pointer hover:opacity-80 transition-opacity mt-1">
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
            Y
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[#e8e8e8] text-sm font-medium">You</span>
            <span className="text-accent text-[10px] font-bold uppercase tracking-wide">Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
