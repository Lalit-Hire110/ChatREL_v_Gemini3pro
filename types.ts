export interface AnalysisSubscore {
  category: string;
  score: number; // 0-100
  reasoning: string;
}

export interface SentimentPoint {
  index: number; // Relative point in time (0-100)
  sentiment: number; // -100 to 100
  label: string; // Brief event label
}

export interface WordCloudItem {
  word: string;
  count: number; // Relative weight 1-10
}

export interface AnalysisResult {
  relationshipType: 'Friends' | 'Family' | 'Crush' | 'Couple' | 'Unknown';
  typeConfidence: number; // 0-100
  healthScore: number; // 0-100
  subscores: AnalysisSubscore[];
  sentimentTimeline: SentimentPoint[];
  wordCloud: WordCloudItem[];
  keyInsights: string[];
  summary: string;
  participants: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}