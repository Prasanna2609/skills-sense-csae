import Groq from "groq-sdk";

console.log('API Key loaded:', import.meta.env.VITE_GROQ_API_KEY ? 'YES' : 'NO - KEY MISSING');

export const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Needed for client-side API calls
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";
