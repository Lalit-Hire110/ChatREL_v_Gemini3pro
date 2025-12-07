import React, { useState } from 'react';
import { MessageSquareHeart, Github, Loader2, MessageCircle } from 'lucide-react';
import ChatInput from './components/ChatInput';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import { analyzeChatLogDeep, analyzeChatLogFast } from './services/geminiService';
import { AnalysisResult, QuickScanResult } from './types';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [quickScanResult, setQuickScanResult] = useState<QuickScanResult | null>(null);
  const [chatLogContext, setChatLogContext] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setChatLogContext(text);
    try {
      // Clear previous deep results but keep quick scan if exists
      const result = await analyzeChatLogDeep(text);
      setAnalysisResult(result);
    } catch (error) {
      alert("Analysis failed. Please try again. Ensure your API Key is valid.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickScan = async (text: string) => {
    setIsScanning(true);
    try {
      const result = await analyzeChatLogFast(text);
      setQuickScanResult(result);
    } catch (error) {
      alert("Quick scan failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setQuickScanResult(null);
    setChatLogContext('');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={resetAnalysis}
          >
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MessageSquareHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">ChatREL v4</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Prototype</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {analysisResult && (
                 <button
                 onClick={() => setIsChatOpen(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
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
                Decode Your <span className="text-indigo-600">Relationships</span>
              </h2>
              <p className="text-lg text-slate-600">
                Paste your chat export below. Our <strong>Gemini 3 Pro</strong> engine uses deep reasoning to analyze tone, timing, and emotional patterns, while <strong>Flash Lite</strong> gives you instant pulse checks.
              </p>
            </div>
            
            <ChatInput 
              onAnalyze={handleAnalyze} 
              onQuickScan={handleQuickScan}
              isAnalyzing={isAnalyzing}
              isScanning={isScanning}
            />

            {(isAnalyzing || isScanning) && (
               <div className="mt-8 flex items-center gap-3 text-slate-500 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="font-medium text-sm">
                    {isScanning ? 'Scanning patterns...' : 'Reasoning about emotional dynamics (Thinking Mode)...'}
                  </span>
               </div>
            )}

            {/* Display Quick Scan result if available before Deep Analysis */}
            {quickScanResult && !analysisResult && (
               <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="font-bold text-slate-800">Quick Pulse Check</h3>
                     <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Flash Lite</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 p-3 rounded-lg">
                          <span className="text-xs text-slate-400 uppercase font-bold">Sentiment</span>
                          <p className="font-semibold text-slate-800">{quickScanResult.sentiment}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                          <span className="text-xs text-slate-400 uppercase font-bold">Topic</span>
                          <p className="font-semibold text-slate-800">{quickScanResult.topic}</p>
                      </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic border-l-4 border-blue-500 pl-4">
                      "{quickScanResult.quickSummary}"
                  </p>
               </div>
            )}
          </div>
        ) : (
          <Dashboard result={analysisResult} quickScan={quickScanResult} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 ChatREL Prototype. Powered by Google Gemini API.</p>
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