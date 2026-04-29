# Skill Sense — Project Architecture

## What Problem This Solves
Claude sees everything a user types but never acts 
on repeating patterns. Skill Sense demonstrates what 
that would look like — detecting behavioral patterns 
in real time, building confidence silently, and 
nudging the user to convert those patterns into 
reusable Skills at exactly the right moment. 

## System Architecture

```text
USER INPUT
    │
    ▼
┌─────────────────┐
│   Chat Layer    │  ← Groq API (Llama)
│  (Layer 1)      │     handles responses
└────────┬────────┘
         │ every message
         ▼
┌─────────────────┐
│  CSAE Engine    │  ← runs silently
│  (Layer 2)      │     in background
│                 │
│  • Detector     │  ← matches intent
│  • Scorer       │  ← builds confidence
│  • Nudge Mgr    │  ← manages lifecycle
└────────┬────────┘
         │ threshold crossed
         ▼
┌─────────────────┐
│  Nudge Card     │  ← appears above input
│                 │     Activate / Preview
│                 │     / Not Now
└────────┬────────┘
         │ activate
         ▼
┌─────────────────┐
│  Skills Section │  ← three-panel layout
│                 │     Quick Edit
│                 │     Edit with Claude
└─────────────────┘

ADMIN PANEL (Layer 3)
    │
    ├── Pattern cards
    ├── Confidence bars  
    ├── Signal counts
    └── View in Brief → Full-screen overlay
```

## What This Is
A Claude.ai-style chat app that demonstrates an extension
of Claude's native capabilities — three layers:
- Layer 1: Functional chatbot powered by Groq API (Llama)
- Layer 2: Background pattern detection engine (CSAE)
- Layer 3: Admin panel showing live detection

## Stack
- React + Vite + Tailwind CSS
- Groq SDK — key stored as VITE_GROQ_API_KEY in .env
- No backend, single deployment

## Design
- Background: #1a1a1a / #232323
- Accent: #CF643F (orange)
- Admin panel: #111, right side, 210px
- Nudge card: #1c1812
- Georgia serif for greetings, sans for UI

## Phases
- Phase 1: Foundation — STATUS: COMPLETE
- Phase 2: Layout Shell — STATUS: COMPLETE
- Phase 3: Chatbot Layer — STATUS: COMPLETE
- Phase 4A: CSAE Detection Engine (detector, scorer, pattern manager, seed patterns) — STATUS: COMPLETE
- Phase 4B: Dynamic Skill Generation + System Prompt Injection (Groq background call, activeSkillPrompt state, chat integration) — STATUS: COMPLETE
- Phase 5: Nudge System — STATUS: COMPLETE
- Phase 6A: Chat Persistence (localStorage, real history, sidebar) — STATUS: COMPLETE
- Phase 6B-1: Admin Panel structure, pattern cards, session stats — STATUS: COMPLETE
- Phase 6B-2: Pattern detail modal, event log, reviewer disclaimer — STATUS: COMPLETE
- Phase 6C: Brief/Detail Overlay (full pattern expanded view) — STATUS: COMPLETE
- Phase 6D: Admin View Label (reviewer explainer) — STATUS: IN PROGRESS
- Phase 7: Skills Section (three-panel layout) — STATUS: COMPLETE
- Phase 8: Skill Editing Flow (Quick Edit, Edit with Claude) — STATUS: COMPLETE
- Phase 9: Polish — STATUS: COMPLETE
- Phase 11: Deploy

## Key Flows
### Nudge Flow
User sends 3+ messages matching a pattern →
confidence threshold crossed →
NudgeCard appears above input →
User clicks Activate, Preview Skill, or Not Now

### Skills Preview Flow
User clicks "Preview Skill" on nudge →
navigates to Skills Section →
three-panel layout →
Skill detail visible on right

### Skill Editing Flow
From Skill detail panel, two modes:
- Quick Edit: editable .md textarea, toggleable 
  reference examples from past sessions, 
  .md file upload
- Edit with Claude: split view — live diff 
  left side (changes in orange), conversational 
  edit chat right side

### Admin Flow
Admin toggle in sidebar →
right panel opens (210px) →
pattern cards with confidence bars visible →
View in Brief button at bottom →
full-screen overlay with all patterns expanded

## Pre-Seeded Patterns
[10 patterns — to be defined before Phase 4]

## File Structure
```text
src/
├── components/
│   ├── phase2_layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── AdminPlaceholder.jsx
│   ├── phase3_chat/
│   ├── phase5_nudge/
│   ├── phase6_admin/
│   ├── phase8_skills/
│   ├── phase9_editing/
│   ├── phase10_polish/
│   └── shared/
│       └── Tooltip.jsx
├── engine/
├── hooks/
├── data/
└── styles/
    └── index.css
```

## Testing
Framework: Vitest + React Testing Library
- src/tests/phase2_layout.test.jsx
- src/tests/phase3_chat.test.jsx

