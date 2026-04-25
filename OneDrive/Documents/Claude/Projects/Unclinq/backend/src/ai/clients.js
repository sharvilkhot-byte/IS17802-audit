const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Anthropic (Claude) ───────────────────────────────────────────────────
let anthropicClient = null;

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. ' +
      'Claude is required for Emora, Pattern Reports, and session extraction. ' +
      'Get your key at https://console.anthropic.com'
    );
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

// ─── Gemini ───────────────────────────────────────────────────────────────
let geminiClient = null;
let geminiFlashModel = null;

function getGeminiFlash() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is not configured. ' +
      'Gemini is required for Action Lab matching and Insight Tab filtering. ' +
      'Get your key at https://aistudio.google.com'
    );
  }
  if (!geminiFlashModel) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiFlashModel = geminiClient.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 1024
      }
    });
  }
  return geminiFlashModel;
}

// ─── Helper: Claude message ───────────────────────────────────────────────
async function claudeMessage({ system, messages, maxTokens = 300, model = 'claude-sonnet-4-6' }) {
  const claude = getAnthropic();
  const response = await claude.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages
  });
  return response.content[0].text;
}

// ─── Helper: Gemini message ───────────────────────────────────────────────
async function geminiMessage({ systemInstruction, prompt }) {
  const model = getGeminiFlash();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
  });
  return result.response.text();
}

module.exports = { getAnthropic, getGeminiFlash, claudeMessage, geminiMessage };
