import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const MODEL_DEEP_THINKING = 'gemini-3-pro-preview';
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
    sentimentTimeline: {
      type: Type.ARRAY,
      description: 'A series of 10-20 data points representing the emotional journey throughout the conversation.',
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.NUMBER, description: 'Relative time/index (0-100)' },
          sentiment: { type: Type.NUMBER, description: 'Sentiment score from -100 (Negative) to 100 (Positive)' },
          label: { type: Type.STRING, description: 'Very brief (2-3 words) label for this moment or interaction' },
        },
        required: ['index', 'sentiment', 'label'],
      },
    },
    wordCloud: {
      type: Type.ARRAY,
      description: 'Top 15-20 most significant words, topics, or emojis used in the chat.',
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          count: { type: Type.NUMBER, description: 'Relative importance/frequency (1-10)' },
        },
        required: ['word', 'count'],
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
  required: ['relationshipType', 'healthScore', 'subscores', 'sentimentTimeline', 'wordCloud', 'keyInsights', 'summary'],
};

/**
 * Performs a deep analysis of the chat log using Gemini 3 Pro with Thinking Mode.
 */
export const analyzeChatLogDeep = async (chatLog: string): Promise<AnalysisResult> => {
  try {
    const MAX_CHARS = 100000;
    const processedLog = chatLog.length > MAX_CHARS 
      ? chatLog.substring(0, MAX_CHARS) + "\n...[truncated due to length]" 
      : chatLog;

    const prompt = `
      You are ChatREL v5, an expert relationship analyst AI. 
      Analyze the following chat log between two people. 
      
      Determine the relationship type, health score, and provide deep insights.
      
      CRITICAL:
      1. Create a 'sentimentTimeline' that maps the emotional flow of the conversation from start to finish.
      2. Generate a 'wordCloud' of significant terms, topics, or emojis that define their dynamic.
      3. Analyze interaction timing, sentiment, and engagement markers.
      
      CHAT LOG:
      ${processedLog}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_DEEP_THINKING,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: {
          thinkingBudget: 32768, 
        },
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
 * Chat with the Analyst feature using standard Gemini 3 Pro.
 */
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, chatContext: string) => {
  try {
    const systemInstruction = `
      You are the ChatREL v5 AI assistant. You have access to a chat log analysis provided by the user.
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