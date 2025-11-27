
import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, Send, Copy, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { aiRenamerService } from '../services/gemini';

export const ResearchTerminal: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await aiRenamerService.performLegalResearch(query);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || "Failed to conduct research. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-800 font-sans transition-colors">
      <div className="bg-[#0f172a] text-[#f8fafc] px-6 py-4 border-b-4 border-[#f59e0b] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#f59e0b]" />
          <h2 className="font-serif font-bold tracking-widest text-sm">LEGAL INTELLIGENCE</h2>
        </div>
        <div className="flex gap-4 text-[10px] font-mono tracking-wider opacity-70">
          <span>GEMINI-1.5-FLASH</span>
          <span>GROUNDING: GOOGLE SEARCH</span>
          <span className="text-[#f59e0b]">SECURE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {!response && !isLoading && !error && (
           <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-slate-600">
             <BookOpen className="w-16 h-16 mb-4 opacity-50" />
             <p>Enter a query to research Case Law, Statutes, or Precedents.</p>
           </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin mb-4" />
            <p className="font-mono text-xs tracking-widest text-stone-500">ANALYZING JURISPRUDENCE...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {response && (
          <div className="pl-6 border-l-4 border-[#f59e0b] space-y-4 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex items-center gap-2 text-[#d97706] font-mono text-xs font-bold uppercase mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Memorandum of Law</span>
             </div>
             
             <div className="prose prose-sm dark:prose-invert max-w-none text-[#0f172a] dark:text-slate-200 leading-relaxed">
               {/* Simple formatting for markdown-like response */}
               {response.split('\n').map((line, i) => (
                 <p key={i} className="mb-2">{line}</p>
               ))}
             </div>

             <div className="flex gap-2 pt-4 border-t border-stone-100 dark:border-slate-800">
               <button onClick={() => navigator.clipboard.writeText(response)} className="flex items-center gap-2 px-3 py-1.5 border border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#f8fafc] dark:hover:bg-slate-700 text-xs font-medium text-[#0f172a] dark:text-slate-200 rounded-sm transition-colors">
                 <Copy className="w-3 h-3" /> Copy
               </button>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t border-[#e2e8f0] dark:border-slate-800 shrink-0">
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter legal query, case citation, or statute..."
            className="w-full bg-[#f8fafc] dark:bg-slate-900 text-[#0f172a] dark:text-slate-100 placeholder-[#94a3b8] font-medium border-2 border-[#cbd5e1] dark:border-slate-700 focus:border-[#0f172a] dark:focus:border-slate-500 rounded-sm py-4 pl-4 pr-14 outline-none transition-colors shadow-inner"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading || !query}
            className="absolute right-3 top-3 p-1.5 bg-[#0f172a] dark:bg-slate-700 text-white hover:bg-[#1e293b] dark:hover:bg-slate-600 rounded-sm transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
