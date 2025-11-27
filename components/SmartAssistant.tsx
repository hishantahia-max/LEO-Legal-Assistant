
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText } from 'lucide-react';
import { aiRenamerService } from '../services/gemini';
import { DocumentEntity } from '../types';

interface Props {
  documents: DocumentEntity[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const SmartAssistant: React.FC<Props> = ({ documents }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello Counselor. I have analyzed your case docket. How can I assist you with the files today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await aiRenamerService.chatWithAssistant(messages, documents, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, but I encountered an error connecting to the legal knowledge base." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f7f5] dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="h-20 bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 px-8 flex items-center justify-between shadow-sm flex-shrink-0">
        <div>
           <h2 className="text-2xl font-serif font-bold text-[#1a2333] dark:text-slate-100 flex items-center gap-2">
             <Sparkles className="w-6 h-6 text-[#cfb586]" />
             Smart Counsel
           </h2>
           <p className="text-xs text-stone-500 dark:text-slate-500">Powered by Gemini 1.5 Pro • Context: {documents.length} Documents</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
             <div className={`
               w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
               ${msg.role === 'assistant' ? 'bg-[#1a2333] dark:bg-slate-700 text-[#cfb586]' : 'bg-stone-200 dark:bg-slate-800 text-stone-600 dark:text-slate-300'}
             `}>
               {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
             </div>
             <div className={`
               p-5 rounded-2xl text-sm leading-relaxed shadow-sm
               ${msg.role === 'assistant' 
                 ? 'bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none' 
                 : 'bg-[#cfb586] text-[#1a2333] font-medium rounded-tr-none'}
             `}>
               {msg.content.split('\n').map((line, i) => (
                 <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
               ))}
             </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 ml-14">
             <div className="w-2 h-2 bg-stone-300 dark:bg-slate-600 rounded-full animate-bounce" />
             <div className="w-2 h-2 bg-stone-300 dark:bg-slate-600 rounded-full animate-bounce delay-100" />
             <div className="w-2 h-2 bg-stone-300 dark:bg-slate-600 rounded-full animate-bounce delay-200" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 shrink-0">
         <div className="max-w-4xl mx-auto relative">
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Ask to summarize a case, draft a letter, or check dates..."
             className="w-full pl-6 pr-14 py-4 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#cfb586] focus:border-[#cfb586] transition-all outline-none text-slate-700 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-500"
           />
           <button 
             onClick={handleSend}
             disabled={isLoading || !input.trim()}
             className="absolute right-3 top-3 p-2 bg-[#1a2333] dark:bg-slate-700 text-white rounded-lg hover:bg-[#2d3a52] dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             <Send className="w-4 h-4" />
           </button>
         </div>
         <p className="text-center text-[10px] text-stone-400 dark:text-slate-500 mt-2">
           AI responses are generated based on document OCR content. Verify important legal details.
         </p>
      </div>
    </div>
  );
};
