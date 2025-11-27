
import React, { useState } from 'react';
import { Mic, Square, FileCheck, AlertCircle } from 'lucide-react';

export const StenographerWidget: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="w-full max-w-sm bg-[#1e293b] rounded-sm border border-[#334155] shadow-xl overflow-hidden font-sans">
      
      {/* Header / Display */}
      <div className="bg-[#0f172a] p-4 border-b border-[#334155]">
        <div className="flex justify-between items-center mb-3">
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-[#b91c1c] animate-pulse' : 'bg-[#64748b]'}`}></div>
             <span className="text-[10px] font-mono text-[#94a3b8] tracking-widest uppercase">
               {isRecording ? 'REC 00:04' : 'STANDBY'}
             </span>
           </div>
           <span className="text-[10px] font-mono text-[#f59e0b]">PCM 16-BIT</span>
        </div>

        {/* Waveform Visualization */}
        <div className="h-12 flex items-center justify-center gap-[2px] mb-4">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 bg-[#f59e0b] rounded-sm transition-all duration-75 ${isRecording ? 'animate-waveform' : 'h-1 opacity-20'}`}
              style={{ 
                height: isRecording ? `${Math.random() * 100}%` : '4px',
                animationDelay: `${i * 0.05}s` 
              }}
            ></div>
          ))}
        </div>

        {/* Transcript Preview */}
        <div className="bg-black/40 rounded-sm p-3 border border-white/5 min-h-[80px]">
          <p className="font-mono text-xs text-[#e2e8f0] leading-relaxed">
            <span className="text-[#64748b] mr-2">00:01</span>
            Draft a notice to the tenant regarding non-payment of rent for the month of...
            <span className="inline-block w-1.5 h-3 bg-[#f59e0b] ml-1 animate-pulse align-middle"></span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 grid grid-cols-2 gap-3 bg-[#1e293b]">
        {!isRecording ? (
          <button 
            onClick={() => setIsRecording(true)}
            className="col-span-2 flex items-center justify-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white py-3 rounded-sm font-bold tracking-wide transition-all shadow-[0_2px_0_#92400e] active:shadow-none active:translate-y-[2px]"
          >
            <Mic className="w-4 h-4" />
            START DICTATION
          </button>
        ) : (
          <>
            <button 
              onClick={() => setIsRecording(false)}
              className="flex items-center justify-center gap-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white py-3 rounded-sm font-bold tracking-wide transition-all shadow-[0_2px_0_#7f1d1d] active:shadow-none active:translate-y-[2px]"
            >
              <Square className="w-4 h-4 fill-current" />
              STOP
            </button>
            <button 
              className="flex items-center justify-center gap-2 bg-[#0f172a] border border-[#334155] hover:bg-[#1e293b] text-white py-3 rounded-sm font-bold tracking-wide transition-all"
            >
              <FileCheck className="w-4 h-4 text-[#f59e0b]" />
              FINISH
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes waveform {
          0%, 100% { height: 10%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-waveform {
          animation: waveform 0.5s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};
