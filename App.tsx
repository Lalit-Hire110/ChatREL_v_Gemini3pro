import React, { useState } from 'react';
import { Github, Loader2, MessageCircle } from 'lucide-react';
import ChatInput from './components/ChatInput';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import { analyzeChatLogDeep } from './services/geminiService';
import { AnalysisResult } from './types';

// SVG Logo Component based on the user's image (Blue/Purple/Pink overlap)
const ChatRELLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-sm">
     <defs>
       <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stopColor="#60a5fa" />
         <stop offset="100%" stopColor="#3b82f6" />
       </linearGradient>
       <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stopColor="#f472b6" />
         <stop offset="100%" stopColor="#ec4899" />
       </linearGradient>
     </defs>
     <circle cx="40" cy="40" r="38" fill="url(#blueGrad)" fillOpacity="0.9" style={{ mixBlendMode: 'multiply' }} />
     <circle cx="60" cy="60" r="38" fill="url(#pinkGrad)" fillOpacity="0.9" style={{ mixBlendMode: 'multiply' }} />
     <path d="M 25 50 L 35 50 L 40 35 L 45 65 L 50 50 L 75 50" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chatLogContext, setChatLogContext] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setChatLogContext(text);
    try {
      const result = await analyzeChatLogDeep(text);
      setAnalysisResult(result);
    } catch (error) {
      alert("Analysis failed. Please try again. Ensure your API Key is valid.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setChatLogContext('');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={resetAnalysis}
          >
            <ChatRELLogo />
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">ChatREL v5</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Prototype</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {analysisResult && (
                 <button
                 onClick={() => setIsChatOpen(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 transition-all"
               >
                 <MessageCircle className="w-4 h-4" />
                 Chat with Analyst
               </button>
             )}
            <a 
              href="#" 
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="View on GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8">
        {!analysisResult ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Decode Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Relationships</span>
              </h2>
              <p className="text-lg text-slate-600">
                Paste your chat export or upload a text file. Our <strong>Gemini 3 Pro</strong> engine uses deep reasoning to analyze tone, timing, and emotional patterns.
              </p>
            </div>
            
            <ChatInput 
              onAnalyze={handleAnalyze} 
              isAnalyzing={isAnalyzing}
            />

            {isAnalyzing && (
               <div className="mt-8 flex items-center gap-3 text-slate-500 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="font-medium text-sm">
                    Reasoning about emotional dynamics (Thinking Mode)...
                  </span>
               </div>
            )}
          </div>
        ) : (
          <Dashboard result={analysisResult} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm flex flex-col gap-2">
          <p>© 2024 ChatREL v5 Prototype. Powered by Google Gemini API.</p>
          <p className="text-xs font-medium text-slate-300">Developer: Lalit Hire (BSC23DS78)</p>
        </div>
      </footer>

      {/* Chat Sidebar */}
      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        context={chatLogContext}
      />
    </div>
  );
}

export default App;