import React, { useState, useRef } from 'react';
import { Sparkles, FileText, Upload } from 'lucide-react';

interface ChatInputProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-pink-50 border-b border-blue-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Input Chat Log
        </h2>
        <div className="flex gap-4">
          <button 
            onClick={triggerFileUpload}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
            Upload .txt
          </button>
          <button 
            onClick={loadExample}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Load Example
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".txt" 
          className="hidden" 
        />
      </div>
      
      <div className="p-6">
        <textarea
          className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono text-sm bg-slate-50 resize-none"
          placeholder="Paste exported WhatsApp/iMessage chat here or upload a .txt file..."
          value={text}
          onChange={handleTextChange}
        />
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onAnalyze(text)}
            disabled={!text.trim() || isAnalyzing}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-200 transition-all
              ${!text.trim() || isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-purple-300'}
            `}
          >
            <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Deep Thinking...' : 'Analyze Relationship'}
          </button>
        </div>
        
        <p className="mt-4 text-xs text-slate-400 text-center">
          Powered by Gemini 3 Pro. Data is processed for analysis only and not stored.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;