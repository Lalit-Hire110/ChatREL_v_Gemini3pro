import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, QuickScanResult } from "../types";

// Initialize Gemini Client
// CRITICAL: Using named parameter as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const MODEL_DEEP_THINKING = 'gemini-3-pro-preview';
const MODEL_FAST_LITE = 'gemini-flash-lite-latest';
const MODEL_CHAT = 'gemini-3-pro-preview';

// Schema for the detailed analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    relationshipType: {
      type: Type.STRING,
      enum: ['Friends', 'Family', 'Crush', 'Couple', 'Unknown'],
      description: 'The classified relationship type based on the chat content.',
    },
    typeConfidence: {
      type: Type.NUMBER,
      description: 'Confidence score for the relationship type (0-100).',
    },
    healthScore: {
      type: Type.NUMBER,
      description: 'Overall relationship health score (0-100).',
    },
    subscores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: 'e.g., Emotional Tone, Responsiveness, Engagement' },
          score: { type: Type.NUMBER, description: 'Score 0-100' },
          reasoning: { type: Type.STRING, description: 'Brief explanation for this score' },
        },
        required: ['category', 'score', 'reasoning'],
      },
    },
    keyInsights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 3-5 key qualitative insights about the relationship dynamic.',
    },
    summary: {
      type: Type.STRING,
      description: 'A concise executive summary of the relationship analysis.',
    },
    participants: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Names or identifiers of the two participants.',
    },
  },
  required: ['relationshipType', 'healthScore', 'subscores', 'keyInsights', 'summary'],
};

/**
 * Performs a deep analysis of the chat log using Gemini 3 Pro with Thinking Mode.
 * Leverages high thinking budget for complex inference.
 */
export const analyzeChatLogDeep = async (chatLog: string): Promise<AnalysisResult> => {
  try {
    // Truncate input to avoid token limit errors.
    // The error reported max tokens 1048576 (1M).
    // We truncate to 100,000 characters (approx 25k tokens) which is sufficient for the use case 
    // and safe from limits.
    const MAX_CHARS = 100000;
    const processedLog = chatLog.length > MAX_CHARS 
      ? chatLog.substring(0, MAX_CHARS) + "\n...[truncated due to length]" 
      : chatLog;

    const prompt = `
      You are ChatREL v4, an expert relationship analyst AI. 
      Analyze the following chat log between two people. 
      Determine the relationship type, health score, and provide deep insights.
      Focus on interaction timing, sentiment, emoji usage, and engagement markers.
      
      CHAT LOG:
      ${processedLog}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_DEEP_THINKING,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        // Using Thinking Mode for deep analysis
        thinkingConfig: {
          thinkingBudget: 32768, 
        },
        // DO NOT set maxOutputTokens when using thinkingBudget
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Deep analysis failed:", error);
    throw error;
  }
};

/**
 * Performs a fast "Pulse Check" using Flash Lite.
 * Low latency, simple output.
 */
export const analyzeChatLogFast = async (chatLog: string): Promise<QuickScanResult> => {
  try {
    // Truncate for speed and token efficiency for the Lite model
    const prompt = `
      Quickly scan this chat log. Identify the dominant sentiment (Positive, Neutral, Negative, Mixed), 
      the main topic of conversation, and a one-sentence summary.
      Return JSON.
      
      Chat Log Snippet:
      ${chatLog.substring(0, 5000)}... (truncated for speed)
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST_LITE, // Flash Lite for speed
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Mixed'] },
            quickSummary: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ['sentiment', 'quickSummary', 'topic']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as QuickScanResult;

  } catch (error) {
    console.error("Fast scan failed:", error);
    throw error;
  }
};

/**
 * Chat with the Analyst feature using standard Gemini 3 Pro.
 */
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, chatContext: string) => {
  try {
    // Increase context slightly but keep safely within bounds
    const systemInstruction = `
      You are the ChatREL v4 AI assistant. You have access to a chat log analysis provided by the user.
      Answer questions about the specific relationship dynamics, health scores, or nuances found in the text.
      Be helpful, objective, and empathetic but professional.
      
      CONTEXT (The chat log being analyzed):
      ${chatContext.substring(0, 30000)}
    `;

    const chat = ai.chats.create({
      model: MODEL_CHAT,
      config: {
        systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Chat message failed:", error);
    throw error;
  }
};