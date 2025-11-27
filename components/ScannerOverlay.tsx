
import React from 'react';
import { Camera, Zap, X, Image as ImageIcon, Maximize } from 'lucide-react';

interface ScannerProps {
  onCapture: () => void;
  onClose: () => void;
}

export const ScannerOverlay: React.FC<ScannerProps> = ({ onCapture, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col font-sans">
      
      {/* Top HUD */}
      <div className="flex justify-between items-center p-6 text-white/80 shrink-0">
        <div className="font-mono text-xs tracking-widest flex flex-col">
          <span className="text-[#f59e0b]">OPTICAL RECOGNITION ACTIVE</span>
          <span className="opacity-50">ISO 19005-1 COMPLIANT</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-sm transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        {/* The Scanning Area */}
        <div className="relative w-full max-w-lg aspect-[3/4] border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {/* Corner Markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#f59e0b] -translate-x-0.5 -translate-y-0.5"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#f59e0b] translate-x-0.5 -translate-y-0.5"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#f59e0b] -translate-x-0.5 translate-y-0.5"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#f59e0b] translate-x-0.5 translate-y-0.5"></div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
            <div className="border-r border-b border-white"></div>
            <div className="border-r border-b border-white"></div>
            <div className="border-b border-white"></div>
            <div className="border-r border-b border-white"></div>
            <div className="border-r border-b border-white"></div>
            <div className="border-b border-white"></div>
            <div className="border-r border-white"></div>
            <div className="border-r border-white"></div>
            <div className=""></div>
          </div>

          {/* Scan Line Animation */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-[#f59e0b] shadow-[0_0_15px_#f59e0b] opacity-80 animate-scan pointer-events-none"></div>

          {/* Status Text */}
          <div className="absolute bottom-4 left-0 w-full text-center">
             <span className="bg-black/60 px-3 py-1 text-[10px] font-mono text-white/90 tracking-widest border border-white/20 rounded-sm">
               ALIGN DOCUMENT EDGES
             </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#0f172a] p-8 pb-12 shrink-0 border-t border-white/10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          <button className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group">
            <div className="p-3 border border-white/20 rounded-sm group-hover:border-white/50 bg-[#1e293b]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono tracking-wide">IMPORT</span>
          </button>

          <button 
            onClick={onCapture}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-[#d97706]/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center bg-[#1e293b] group-active:scale-95 transition-all">
              <div className="w-14 h-14 bg-[#f59e0b] rounded-full shadow-inner border-4 border-[#1e293b]"></div>
            </div>
          </button>

          <button className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group">
            <div className="p-3 border border-white/20 rounded-sm group-hover:border-white/50 bg-[#1e293b]">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono tracking-wide">FLASH</span>
          </button>

        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
