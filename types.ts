export interface AnalysisSubscore {
  category: string;
  score: number; // 0-100
  reasoning: string;
}

export interface AnalysisResult {
  relationshipType: 'Friends' | 'Family' | 'Crush' | 'Couple' | 'Unknown';
  typeConfidence: number; // 0-100
  healthScore: number; // 0-100
  subscores: AnalysisSubscore[];
  keyInsights: string[];
  summary: string;
  participants: string[];
}

export interface QuickScanResult {
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  quickSummary: string;
  topic: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}