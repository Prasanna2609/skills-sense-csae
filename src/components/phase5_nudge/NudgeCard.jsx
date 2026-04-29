import React from 'react';

const NudgeCard = ({ activeNudge, isPreparingNudge, onActivate, onPreview, onDismiss }) => {
  // ── Loading state ──────────────────────────────────────────────
  if (isPreparingNudge && !activeNudge) {
    return (
      <div
        data-testid="nudge-loading"
        className="mb-[7px] rounded-[11px] px-[14px] py-[12px] animate-pulse"
        style={{
          background: '#1c1812',
          border: '0.5px solid rgba(207,100,63,0.38)'
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center shrink-0"
            style={{ background: 'rgba(207,100,63,0.13)' }}
          >
            <span className="text-accent text-[13px]">✳</span>
          </div>
          <span className="text-[12.5px]" style={{ color: 'rgba(207,100,63,0.7)' }}>
            Skill Sense is preparing your Skill...
          </span>
        </div>
      </div>
    );
  }

  if (!activeNudge) return null;

  const { pattern, generatedSkill, nudgeStage } = activeNudge;
  const nudgeCopy = pattern.nudges[nudgeStage] || pattern.nudges.n1;
  const skillName = generatedSkill?.name || pattern.name;

  // ── Parse nudge copy: bold content between special markers ─────
  // Bold any text wrapped in numbers+words pattern at start of sentences
  const renderSubtitle = (text) => {
    // Split on segments that look like they should be bold
    // Bold patterns: numbers with units (e.g., "3 sessions", "15 minutes", "400 tokens")
    const parts = text.split(/(\d+\s+\w+)/g);
    return parts.map((part, i) => {
      if (/^\d+\s+\w+$/.test(part)) {
        return <span key={i} style={{ color: '#b8b0a8', fontWeight: 600 }}>{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      data-testid="nudge-card"
      className="mb-[7px] rounded-[11px] px-[14px] py-[12px]"
      style={{
        background: '#1c1812',
        border: '0.5px solid rgba(207,100,63,0.38)'
      }}
    >
      {/* Top row: icon + title + subtitle */}
      <div className="flex gap-[10px]">
        <div
          className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center shrink-0 mt-[1px]"
          style={{ background: 'rgba(207,100,63,0.13)' }}
        >
          <span className="text-[#CF643F] text-[13px]">✳</span>
        </div>
        <div className="flex-1 min-w-0">
          <div
            data-testid="nudge-title"
            className="text-[12.5px] font-semibold leading-tight"
            style={{ color: '#e0dbd5' }}
          >
            I've drafted a Skill for you — {skillName}
          </div>
          <div
            data-testid="nudge-subtitle"
            className="text-[12px] mt-[4px] leading-[1.4]"
            style={{ color: '#777' }}
          >
            {renderSubtitle(nudgeCopy)}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-[8px] mt-[10px] ml-[36px]">
        <button
          data-testid="nudge-activate"
          onClick={onActivate}
          className="text-[11.5px] font-medium px-[12px] py-[5px] rounded-[6px] transition-opacity hover:opacity-90"
          style={{
            background: '#CF643F',
            border: 'none',
            color: '#fff'
          }}
        >
          ✳ Activate — 1 click
        </button>
        <button
          data-testid="nudge-preview"
          onClick={onPreview}
          className="text-[11.5px] font-medium px-[12px] py-[5px] rounded-[6px] transition-opacity hover:opacity-80"
          style={{
            background: 'transparent',
            border: '0.5px solid #333',
            color: '#888'
          }}
        >
          Preview Skill
        </button>
        <button
          data-testid="nudge-dismiss"
          onClick={onDismiss}
          className="text-[11px] px-[8px] py-[5px] transition-opacity hover:opacity-80"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#555'
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default NudgeCard;
