const seedPatterns = [
  {
    id: 'code-generator',
    name: 'Code Generator',
    domain: 'Software development',
    anchors: ['code', 'function', 'component', 'build', 'implement', 'class', 'script', 'api', 'endpoint', 'algorithm', 'typescript', 'python', 'javascript', 'react', 'backend'],
    nudges: {
      n1: "It looks like you've been explaining your coding conventions across 3 sessions now. I've put together a Skill — Code Generator — so your stack and standards are just there when you need them.",
      n2: "You've walked Claude through your conventions 4 times now — that is about 15 minutes of setup, and around 400 tokens each time too. Your Skill is ready when you are.",
      n3: "5 coding sessions, the same architectural context every time. A Skill locks in your conventions so the first line of code already follows your standards — no setup, consistent output every time."
    },
    why: "Tracks when users ask Claude to write code, functions, or algorithms. Over time, Claude learns the user's specific tech stack, architecture formatting, and preferred language idioms.",
    examples: [
      "write a python script to parse this json file",
      "can you build a react component for a navigation bar",
      "how do I implement a sorting algorithm in typescript"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'email-assistant',
    name: 'Email Assistant',
    domain: 'Professional communication',
    anchors: ['email', 'message', 'client', 'professional', 'formal', 'draft', 'send', 'reply', 'tone', 'outreach', 'correspondence', 'follow up', 'respond', 'prospect', 'write'],
    nudges: {
      n1: "You've been setting the same tone and format across your emails — I've noticed it 3 times now. I've drafted a Skill — Email Assistant — so you never have to re-establish that again.",
      n2: "4 email sessions with the same preferences re-explained each time — about 20 minutes of repeated setup, and roughly 350 tokens per session. Your Skill is ready and waiting.",
      n3: "5 emails, the same style correction every time. The output shifts slightly each session because the setup shifts slightly. A Skill locks in your best version — consistent every time."
    },
    why: "Detects when users draft professional emails, client messages, or outreach correspondence. This pattern helps Claude lock onto the user's desired formal tone, structure, and writing style.",
    examples: [
      "write a formal email to my client confirming our meeting tomorrow",
      "can you draft a follow up message to the prospect I spoke to earlier",
      "draft a reply to this email declining the offer nicely"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'research-synthesiser',
    name: 'Research Synthesiser',
    domain: 'Academic and research',
    anchors: ['research', 'paper', 'article', 'summarise', 'synthesise', 'findings', 'methodology', 'literature', 'study', 'evidence', 'analysis', 'review', 'academic', 'citation', 'sources'],
    nudges: {
      n1: "You've been bringing the same research framework to every synthesis session — I've seen it 3 times now. I've built a Skill — Research Synthesiser — so that lens is already applied when you start.",
      n2: "4 research sessions reconstructing the same analytical structure each time — around 18 minutes and 420 tokens of repeated setup. Your Skill has been drafted and is ready.",
      n3: "5 synthesis sessions, the same scaffolding every time. A Skill means your framework is front-loaded — deeper analysis from the very first response."
    },
    why: "Identifies requests to summarise academic papers, articles, or research findings. This allows Claude to learn the preferred summarization depth, citation format, and analytical lens of the user.",
    examples: [
      "summarise the findings of this research paper",
      "synthesise these three methodologies into a coherent review",
      "can you review this article and extract the main arguments"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    domain: 'Data and analytics',
    anchors: ['data', 'analyse', 'dataset', 'trends', 'spreadsheet', 'metrics', 'insights', 'patterns', 'statistics', 'results', 'numbers', 'interpret', 'anomalies', 'chart', 'figures'],
    nudges: {
      n1: "You've been applying the same analytical lens across 3 sessions now. I've put together a Skill — Data Analyst — so your preferred interpretation framework is just there from the start.",
      n2: "4 data sessions rebuilding the same context each time — about 16 minutes and 380 tokens of repeated setup. Your Skill is drafted and ready.",
      n3: "5 analysis sessions, the same framing every time. A Skill means the first output already reflects how you think about data — no setup required."
    },
    why: "Observes when users upload datasets, spreadsheets, or ask for insights and trends. Claude can then streamline future data interpretation by anticipating the required metrics and chart structures.",
    examples: [
      "analyse this dataset and tell me the key trends",
      "what insights can you draw from these monthly sales metrics",
      "interpret the anomalies in this spreadsheet data"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'concept-explainer',
    name: 'Concept Explainer',
    domain: 'Education and learning',
    anchors: ['explain', 'understand', 'concept', 'teach', 'learning', 'definition', 'analogy', 'example', 'breakdown', 'clarify', 'what is', 'how does', 'beginner', 'overview', 'intuition'],
    nudges: {
      n1: "You've been asking for the same explanation style across 3 sessions — the same depth, the same approach to analogies. I've built a Skill — Concept Explainer — so that is just how Claude explains things to you.",
      n2: "4 sessions re-establishing the same learning preferences — about 12 minutes and 280 tokens each time. Your Skill is ready whenever you would like to activate it.",
      n3: "5 explanations, the same style correction every time. A Skill means the first explanation already matches how you think — no adjustments needed."
    },
    why: "Monitors requests asking Claude to explain, break down, or clarify concepts. The pattern tracks whether the user prefers beginner-friendly analogies or deep technical overviews.",
    examples: [
      "explain how a blockchain works using a simple analogy",
      "what is quantum computing and how does it work",
      "can you give me a beginner overview of machine learning"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'mom-writer',
    name: 'MOM Writer',
    domain: 'Meeting operations',
    anchors: ['meeting', 'notes', 'mom', 'minutes', 'action items', 'call', 'discussion', 'summary', 'attendees', 'decisions', 'follow up', 'agenda', 'recap', 'standup', 'sync'],
    nudges: {
      n1: "You've been rebuilding the same meeting structure across 3 sessions now. I've put together a Skill — MOM Writer — so your format is just there after every call.",
      n2: "4 meetings, the same sections reconstructed each time — around 16 minutes and 320 tokens of repeated formatting work. Your Skill has been drafted and is ready.",
      n3: "5 meetings, the same manual setup every time. A Skill produces your preferred structure automatically — consistent output, nothing to reconstruct."
    },
    why: "Detects formatting of meeting notes, action items, and call summaries. By tracking this, Claude learns the exact bulleted structure and recap format the user prefers.",
    examples: [
      "format these call notes into a structured mom with action items",
      "write a summary of our weekly sync and list the decisions made",
      "recap this discussion into a standup agenda"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'tech-doc-writer',
    name: 'Tech Doc Writer',
    domain: 'Technical documentation',
    anchors: ['readme', 'documentation', 'api', 'comment', 'docs', 'spec', 'technical', 'architecture', 'endpoint', 'function', 'document', 'parameters', 'returns', 'example', 'usage'],
    nudges: {
      n1: "You've been applying the same documentation standards across 3 sessions now. I've built a Skill — Tech Doc Writer — so your conventions are front-loaded from the start.",
      n2: "4 documentation sessions with the same standards re-explained each time — about 20 minutes and 440 tokens of repeated setup. Your Skill is ready.",
      n3: "5 documents, the same convention overhead every time. A Skill means your standards are already embedded — the first output is correctly structured without any setup."
    },
    why: "Captures when users generate READMEs, API specs, or technical documentation. This helps to enforce consistent parameter descriptions, returns, and component architecture documentation.",
    examples: [
      "write a technical readme for this new backend endpoint",
      "document the parameters and returns for this typescript function",
      "create an api spec based on this architecture document"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'strategy-thinker',
    name: 'Strategy Thinker',
    domain: 'Business strategy',
    anchors: ['strategy', 'decision', 'trade-off', 'business', 'opportunity', 'plan', 'approach', 'problem', 'competitive', 'market', 'evaluate', 'framework', 'prioritise', 'think through', 'analyse'],
    nudges: {
      n1: "You've been re-briefing your business context and decision approach across 3 sessions. I've put together a Skill — Strategy Thinker — so that context is already there when you need to think something through.",
      n2: "4 strategy sessions rebuilding the same business background each time — about 25 minutes and 500 tokens of context-setting. Your Skill has been drafted and is ready.",
      n3: "5 sessions, the same briefing overhead every time. A Skill means Claude already knows your context — the first response is already grounded in your reality."
    },
    why: "Tracks strategic problem-solving, market analysis, and trade-off evaluations. Claude uses this to build a persistent business context so every strategic answer is grounded in the user's reality.",
    examples: [
      "evaluate the trade-offs of entering this new market",
      "help me think through a strategy for our upcoming product launch",
      "analyse the problem with our current business approach"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    domain: 'Creative and social content',
    anchors: ['post', 'content', 'blog', 'social', 'brand', 'voice', 'audience', 'copy', 'marketing', 'publish', 'announcement', 'caption', 'article', 'write up', 'draft'],
    nudges: {
      n1: "You've been bringing the same content voice and structure to 3 sessions now. I've built a Skill — Content Creator — so your voice is just there from the first word.",
      n2: "4 content sessions correcting toward the same voice each time — around 18 minutes and 360 tokens of repeated style guidance. Your Skill is ready to activate.",
      n3: "5 pieces, the same voice correction every time. A Skill captures your style so the first draft already sounds like you — no rounds of correction needed."
    },
    why: "Recognizes drafting of social posts, blogs, and brand copy. Claude will learn the specific brand voice and audience nuances to generate first drafts that require minimal editing.",
    examples: [
      "write a social media post announcing our new feature",
      "draft a blog post about our latest brand initiative",
      "can you write some marketing copy for this upcoming event"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  },
  {
    id: 'career-coach',
    name: 'Career Coach',
    domain: 'Personal and career development',
    anchors: ['interview', 'cv', 'resume', 'cover letter', 'job', 'career', 'role', 'application', 'behavioural', 'star', 'skills', 'experience', 'hire', 'position', 'candidate'],
    nudges: {
      n1: "You've been walking Claude through the same professional background across 3 sessions now. I've built a Skill — Career Coach — so your context is always loaded when you need it.",
      n2: "4 career prep sessions rebuilding the same profile each time — about 20 minutes and 400 tokens of repeated context. Your Skill has been drafted and is ready whenever you are.",
      n3: "5 sessions, the same preamble every time. A Skill front-loads your background so every session starts from where you actually are — no re-introductions needed."
    },
    why: "Observes requests related to interview prep, resume polishing, and job applications. This allows Claude to retain the user's background and experience for seamless subsequent coaching sessions.",
    examples: [
      "help me prepare for a behavioural interview for a product role",
      "can you review my cv and suggest improvements based on my experience",
      "draft a cover letter for this job application"
    ],
    counter: 0,
    stage: 'monitoring',
    snoozeCount: 0,
    matchedPrompts: []
  }
];

export default seedPatterns;
