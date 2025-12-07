import React, { useState } from 'react';
import { Sparkles, Bolt, FileText } from 'lucide-react';

interface ChatInputProps {
  onAnalyze: (text: string) => void;
  onQuickScan: (text: string) => void;
  isAnalyzing: boolean;
  isScanning: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onAnalyze, onQuickScan, isAnalyzing, isScanning }) => {
  const [text, setText] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const loadExample = () => {
    const example = `[12/10/23, 09:15:22] Alice: Hey! Are we still on for tonight? 🌮
[12/10/23, 09:45:10] Bob: Oh hey. Um, actually works been crazy. Might need to raincheck.
[12/10/23, 09:46:05] Alice: Oh. That's the third time this month... is everything okay?
[12/10/23, 10:15:30] Bob: Yeah, just busy. Sorry.
[12/10/23, 10:16:00] Alice: OK. Let me know when you're free then.
[12/10/23, 21:00:00] Bob: Hey, sorry about earlier. I feel bad. Free for a call?
[12/10/23, 21:02:15] Alice: Sure.`;
    setText(example);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Input Chat Log
        </h2>
        <button 
          onClick={loadExample}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Load Example
        </button>
      </div>
      
      <div className="p-6">
        <textarea
          className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm bg-slate-50 resize-none"
          placeholder="Paste exported WhatsApp/iMessage chat here..."
          value={text}
          onChange={handleTextChange}
        />
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
           <button
            onClick={() => onQuickScan(text)}
            disabled={!text.trim() || isScanning || isAnalyzing}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-amber-500 text-amber-700 font-semibold transition-all
              ${!text.trim() || isScanning || isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-50'}
            `}
          >
             <Bolt className={`w-5 h-5 ${isScanning ? 'animate-pulse' : ''}`} />
             {isScanning ? 'Scanning...' : 'Quick Pulse Check (Flash Lite)'}
          </button>

          <button
            onClick={() => onAnalyze(text)}
            disabled={!text.trim() || isAnalyzing || isScanning}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 transition-all
              ${!text.trim() || isAnalyzing || isScanning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5'}
            `}
          >
            <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Deep Thinking...' : 'Analyze Relationship (Pro)'}
          </button>
        </div>
        
        <p className="mt-4 text-xs text-slate-400 text-center">
          Powered by Gemini 3 Pro (Deep Thinking) & Gemini Flash Lite (Fast Responses). 
          Data is processed for analysis only and not stored.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;