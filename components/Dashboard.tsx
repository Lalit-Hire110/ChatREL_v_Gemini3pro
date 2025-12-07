import React from 'react';
import { AnalysisResult, QuickScanResult } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine
} from 'recharts';
import { Heart, Activity, Zap, BrainCircuit, TrendingUp, Hash } from 'lucide-react';

interface DashboardProps {
  result: AnalysisResult;
  quickScan: QuickScanResult | null;
}

const Dashboard: React.FC<DashboardProps> = ({ result, quickScan }) => {
  
  // Prepare data for Radar Chart
  const radarData = result.subscores.map(s => ({
    subject: s.category,
    A: s.score,
    fullMark: 100,
  }));

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50';
    if (score >= 50) return 'bg-amber-50';
    return 'bg-rose-50';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto animate-fade-in-up">
      
      {/* Quick Scan Banner (if available) */}
      {quickScan && (
        <div className="lg:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl flex items-start gap-4 shadow-sm">
            <div className="p-2 bg-white rounded-full shadow-sm text-blue-500">
                <Zap className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Quick Pulse (Flash Lite)</h4>
                <p className="text-blue-800 font-medium mt-1">
                    Sentiment: <span className="font-bold">{quickScan.sentiment}</span> • Topic: {quickScan.topic}
                </p>
                <p className="text-sm text-blue-600 mt-1">{quickScan.quickSummary}</p>
            </div>
        </div>
      )}

      {/* Main Health Score Card */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <h3 className="text-lg font-semibold text-slate-500 mb-6 uppercase tracking-wider text-center">Relationship Health</h3>
        
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Simple CSS gauge representation */}
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle 
                    cx="96" cy="96" r="88" 
                    stroke="currentColor" strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - result.healthScore / 100)}
                    className={`${getHealthColor(result.healthScore)} transition-all duration-1000 ease-out`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-5xl font-bold ${getHealthColor(result.healthScore)}`}>{result.healthScore}</span>
                <span className="text-slate-400 text-sm font-medium mt-1">/ 100</span>
            </div>
        </div>

        <div className="mt-8 text-center">
             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getHealthBg(result.healthScore)} ${getHealthColor(result.healthScore)} font-bold`}>
                <Heart className="w-5 h-5 fill-current" />
                {result.relationshipType} ({result.typeConfidence}%)
             </div>
             <p className="text-xs text-slate-400 mt-4">
                Participants: {result.participants.join(' & ') || 'Detected'}
             </p>
        </div>
      </div>

      {/* Metrics Radar Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Interaction Dynamics
            </h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">Thinking Budget: 32k</span>
        </div>
        
        <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="#818cf8"
                    fillOpacity={0.3}
                />
                </RadarChart>
            </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {result.subscores.map((sub, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-600 uppercase">{sub.category}</span>
                        <span className="text-sm font-bold text-indigo-600">{sub.score}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{sub.reasoning}</p>
                </div>
            ))}
        </div>
      </div>

      {/* ROW 2: Sentiment Timeline */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-slate-700">Emotional Journey</h3>
        </div>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.sentimentTimeline} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="index" hide />
                    <YAxis hide domain={[-100, 100]} />
                    <Tooltip 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
                                        <p className="font-bold text-slate-700 text-sm mb-1">{payload[0].payload.label}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-400">Sentiment:</span>
                                            <span className={`font-mono font-bold ${Number(payload[0].value) > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {payload[0].value}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Area 
                        type="monotone" 
                        dataKey="sentiment" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorSentiment)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2: Word Cloud */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Hash className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-700">Topic Cloud</h3>
        </div>
        <div className="flex flex-wrap gap-2 justify-center content-start h-[250px] overflow-y-auto scrollbar-hide">
            {result.wordCloud.map((item, i) => (
                <span 
                    key={i} 
                    className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105 cursor-default select-none flex items-center"
                    style={{ 
                        fontSize: `${0.75 + (item.count / 10) * 0.8}rem`,
                        opacity: 0.5 + (item.count / 20)
                    }}
                >
                    {item.word}
                </span>
            ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
         <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            AI Insights
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h4 className="font-medium text-slate-900 mb-3">Executive Summary</h4>
                <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {result.summary}
                </p>
             </div>
             <div>
                <h4 className="font-medium text-slate-900 mb-3">Key Findings</h4>
                <ul className="space-y-3">
                    {result.keyInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                            <span className="mt-1 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {i + 1}
                            </span>
                            {insight}
                        </li>
                    ))}
                </ul>
             </div>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;