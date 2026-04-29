import React, { useState, useCallback, useEffect, useRef } from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: 'white', padding: '20px', background: '#111'}}>
          <h2>Error caught:</h2>
          <pre style={{color: 'red', fontSize: '12px', whiteSpace: 'pre-wrap'}}>
            {this.state.error?.toString()}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
import Sidebar from './components/phase2_layout/Sidebar';
import Header from './components/phase2_layout/Header';
import AdminPanel from './components/phase6_admin/AdminPanel';
import PatternDetailModal from './components/phase6_admin/PatternDetailModal';
import BriefOverlay from './components/phase6_admin/BriefOverlay';
import SkillsSection from './components/phase8_skills/SkillsSection';
import ChatArea from './components/phase3_chat/ChatArea';
import ChatInput from './components/phase3_chat/ChatInput';
import { useGroqChat } from './hooks/useGroqChat';
import { usePatternEngine } from './hooks/usePatternEngine';
import { useNudge } from './hooks/useNudge';
import { useChatHistory } from './hooks/useChatHistory';

function App() {
  const [adminVisible, setAdminVisible] = useState(false);
  const [currentView, setCurrentView] = useState('chat');
  const [sessionStats, setSessionStats] = useState({ promptsSent: 0, skillsCreated: 0 });
  const [eventLog, setEventLog] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [briefOpen, setBriefOpen] = useState(false);

  const prevPatterns = useRef();
  const prevActiveNudge = useRef();

  const {
    messages,
    isLoading,
    activeSkill,
    sendMessage,
    activateSkill,
    skillBadge,
    updateSkillReference,
    updateSkillSystemPrompt,
    loadMessages
  } = useGroqChat();

  const {
    patterns,
    activeNudge,
    isPreparingNudge,
    analyzePrompt,
    analyzePromptRealTime,
    dismissNudge,
    activateNudge
  } = usePatternEngine();

  const { handleInputChange } = useNudge(patterns, activeNudge, analyzePromptRealTime);

  const {
    chats,
    currentChatId,
    saveMessage,
    loadChat,
    startNewChat,
    deleteChat
  } = useChatHistory();

  const handleSendMessage = useCallback(async (userInput) => {
    setSessionStats(prev => ({ ...prev, promptsSent: prev.promptsSent + 1 }));
    const assistantResponse = await sendMessage(userInput);

    if (assistantResponse) {
      await analyzePrompt(userInput, assistantResponse);
    }
  }, [sendMessage, analyzePrompt]);

  // Track event log for generated skills and nudges
  useEffect(() => {
    if (activeNudge && !prevActiveNudge.current) {
      setEventLog(prev => [
        ...prev,
        { type: 'generated', text: `Skill drafted: ${activeNudge.generatedSkill.name}`, time: Date.now() },
        { type: 'nudge', text: `Nudge fired for ${activeNudge.pattern.name}`, time: Date.now() }
      ]);
    }
    prevActiveNudge.current = activeNudge;
  }, [activeNudge]);

  // Track event log for pattern thresholds
  useEffect(() => {
    // Only run if we actually have previous patterns to compare with
    if (prevPatterns.current) {
      const newEvents = [];
      patterns.forEach(p => {
        const oldP = prevPatterns.current.find(old => old.id === p.id);
        if (oldP && oldP.counter < 3 && p.counter >= 3) {
          newEvents.push({ type: 'threshold', text: `${p.name} threshold reached`, time: Date.now() });
        }
      });

      if (newEvents.length > 0) {
        setEventLog(prev => [...prev, ...newEvents]);
      }
    }
    prevPatterns.current = patterns;
  }, [patterns]);

  // Auto-save messages to localStorage after every change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessage(messages);
    }
  }, [messages, saveMessage]);

  // ── Chat history handlers ────────────────────────────────────
  const handleNewChat = useCallback(() => {
    startNewChat();
    loadMessages([]);
  }, [startNewChat, loadMessages]);

  const handleLoadChat = useCallback((chatId) => {
    const msgs = loadChat(chatId);
    loadMessages(msgs);
  }, [loadChat, loadMessages]);

  const handleDeleteChat = useCallback((chatId) => {
    deleteChat(chatId);
    // If deleting the active chat, clear messages
    if (chatId === currentChatId) {
      loadMessages([]);
    }
  }, [deleteChat, currentChatId, loadMessages]);

  // ── Nudge action handlers ────────────────────────────────────
  const handleActivate = useCallback(() => {
    const skillName = activeNudge?.generatedSkill?.name || 'Skill';
    activateNudge(activateSkill);
    setCurrentView('chat');
    setSessionStats(prev => ({ ...prev, skillsCreated: prev.skillsCreated + 1 }));
    setEventLog(prev => [...prev, { type: 'activated', text: `${skillName} activated`, time: Date.now() }]);
  }, [activateNudge, activateSkill, activeNudge]);

  const handlePreview = useCallback(() => {
    activateNudge(activateSkill);
    setCurrentView('skills');
  }, [activateNudge, activateSkill]);

  const handleDismiss = useCallback(() => {
    dismissNudge();
  }, [dismissNudge]);

  const handlePatternClick = useCallback((pattern) => {
    setSelectedPattern(pattern);
  }, []);

  const handleViewDetail = useCallback(() => {
    setBriefOpen(true);
  }, []);

  const handleToggleSkill = useCallback((skill) => {
    if (skill.status === 'activated') {
      // Logic for de-activating (simulated)
    } else {
      activateNudge(activateSkill);
    }
  }, [activateNudge, activateSkill]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full bg-[#1a1a1a] overflow-hidden text-[#e8e8e8] font-sans">
      <Sidebar 
        adminVisible={adminVisible} 
        toggleAdmin={() => setAdminVisible(!adminVisible)}
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {currentView === 'chat' ? (
          <>
            <Header title={messages.length > 0 ? "Current Chat" : "New Chat"} />
            <ChatArea messages={messages} isLoading={isLoading} skillBadge={skillBadge} />
            <ChatInput 
              sendMessage={handleSendMessage} 
              isLoading={isLoading}
              activeNudge={activeNudge}
              isPreparingNudge={isPreparingNudge}
              onActivate={handleActivate}
              onPreview={handlePreview}
              onDismiss={handleDismiss}
              onInputChange={handleInputChange}
            />
          </>
        ) : (
          <SkillsSection 
            skills={activeSkill ? [activeSkill] : []}
            activeSkill={activeSkill}
            onActivate={() => handleActivate()}
            onBack={() => setCurrentView('chat')}
            onSave={updateSkillSystemPrompt}
            onToggleSkill={handleToggleSkill}
            onToggleReference={updateSkillReference}
          />
        )}
      </div>

      {adminVisible ? (
        <AdminPanel
          patterns={patterns}
          promptsSent={sessionStats.promptsSent}
          skillsCreated={sessionStats.skillsCreated}
          eventLog={eventLog}
          onPatternClick={handlePatternClick}
          onViewDetail={handleViewDetail}
        />
      ) : null}

      {selectedPattern ? (
        <PatternDetailModal 
          pattern={selectedPattern} 
          onClose={() => setSelectedPattern(null)} 
        />
      ) : null}

      <BriefOverlay
        briefOpen={briefOpen}
        setBriefOpen={setBriefOpen}
        patterns={patterns}
        sessionStats={sessionStats}
      />
    </div>
    </ErrorBoundary>
  );
}

export default App;
